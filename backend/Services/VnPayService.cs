using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace backend.Services
{
    public class VnPayService
    {
        private readonly IConfiguration _config;

        public VnPayService(IConfiguration config)
        {
            _config = config;
        }

        public string CreatePaymentUrl(string orderCode, decimal amount, string orderInfo, string clientIp)
        {
            var vnpUrl = _config["VnPay:BaseUrl"] ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
            var vnpTmnCode = _config["VnPay:TmnCode"] ?? "DEMOV210";
            var vnpHashSecret = _config["VnPay:HashSecret"] ?? "RAOCTVNXQAWXYZRMYWHNMLPZGUDDYVYN";
            var returnUrl = _config["VnPay:ReturnUrl"] ?? "http://localhost:5000/api/payment/vnpay-return";

            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);

            var payParams = new SortedDictionary<string, string>(new VnPayCompare())
            {
                { "vnp_Version", "2.1.0" },
                { "vnp_Command", "pay" },
                { "vnp_TmnCode", vnpTmnCode },
                { "vnp_Amount", ((long)(amount * 100)).ToString() }, // VNPay requires multiplying by 100
                { "vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss") },
                { "vnp_CurrCode", "VND" },
                { "vnp_IpAddr", string.IsNullOrWhiteSpace(clientIp) ? "127.0.0.1" : clientIp },
                { "vnp_Locale", "vn" },
                { "vnp_OrderInfo", orderInfo },
                { "vnp_OrderType", "other" },
                { "vnp_ReturnUrl", returnUrl },
                { "vnp_TxnRef", orderCode }
            };

            var data = new StringBuilder();
            var query = new StringBuilder();

            foreach (var kv in payParams.Where(kv => !string.IsNullOrEmpty(kv.Value)))
            {
                data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
                query.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }

            var signData = data.ToString().TrimEnd('&');
            var vnpSecureHash = HmacSha512(vnpHashSecret, signData);
            query.Append("vnp_SecureHash=" + vnpSecureHash);

            return vnpUrl + "?" + query.ToString();
        }

        public bool ValidateSignature(IQueryCollection queryParams, out string orderCode, out string responseCode, out string transactionNo, out string bankCode)
        {
            var vnpHashSecret = _config["VnPay:HashSecret"] ?? "RAOCTVNXQAWXYZRMYWHNMLPZGUDDYVYN";
            var payParams = new SortedDictionary<string, string>(new VnPayCompare());

            string inputHash = string.Empty;
            orderCode = string.Empty;
            responseCode = string.Empty;
            transactionNo = string.Empty;
            bankCode = string.Empty;

            foreach (var key in queryParams.Keys)
            {
                if (string.IsNullOrEmpty(key)) continue;
                var value = queryParams[key].ToString();

                if (key.Equals("vnp_SecureHash", StringComparison.OrdinalIgnoreCase))
                {
                    inputHash = value;
                }
                else if (key.StartsWith("vnp_"))
                {
                    payParams.Add(key, value);
                }
            }

            if (payParams.TryGetValue("vnp_TxnRef", out var code)) orderCode = code;
            if (payParams.TryGetValue("vnp_ResponseCode", out var resp)) responseCode = resp;
            if (payParams.TryGetValue("vnp_TransactionNo", out var trans)) transactionNo = trans;
            if (payParams.TryGetValue("vnp_BankCode", out var bank)) bankCode = bank;

            var data = new StringBuilder();
            foreach (var kv in payParams.Where(kv => !string.IsNullOrEmpty(kv.Value)))
            {
                data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }

            var signData = data.ToString().TrimEnd('&');
            var calculatedHash = HmacSha512(vnpHashSecret, signData);

            return calculatedHash.Equals(inputHash, StringComparison.OrdinalIgnoreCase);
        }

        private static string HmacSha512(string key, string inputData)
        {
            var hash = new StringBuilder();
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                var hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                {
                    hash.Append(theByte.ToString("x2"));
                }
            }
            return hash.ToString();
        }

        private class VnPayCompare : IComparer<string>
        {
            public int Compare(string? x, string? y)
            {
                if (x == y) return 0;
                if (x == null) return -1;
                if (y == null) return 1;
                var compare = CompareInfo.GetCompareInfo("en-US");
                return compare.Compare(x, y, CompareOptions.Ordinal);
            }
        }
    }
}
