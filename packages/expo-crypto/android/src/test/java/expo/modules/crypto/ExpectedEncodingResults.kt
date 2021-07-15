package expo.modules.crypto

// These are the expected results for the following encoding for text "Expo"
val expectedEncodingResults = hashMapOf(
  "hex" to hashMapOf(
    "SHA-1" to "c275355dc46ac171633935033d113e3872d595e5",
    "SHA-256" to "f5e5cae536b49d394e1e72d4368d64b00a23298ec5ae11f3a9102a540e2532dc",
    "SHA-384" to "aa356c88afdbd8a7a5a9c3133541af0035e4b04e82438a223aa1939240ccb6b3ca28294b5ac0f42703b15183f4c016fc",
    "SHA-512" to "f1924f3e61aac4e4caa7fd566591b8abb541b0e642cd7bf0c71573267cfacf1b6dafe905bd6e42633bfba67c59774e070095e19a7c2078ac18ccd23245d76f1c",
    "MD2" to "fb85323c3b15b016e0351006e2f47bf7",
    "MD4" to "2d36099794ec182cbb36d02e1188fc1e",
    "MD5" to "c29f23f279126757ba18ec74d0d27cfa"
  ),
  "base64" to hashMapOf(
    "SHA-1" to "wnU1XcRqwXFjOTUDPRE+OHLVleU=",
    "SHA-256" to "9eXK5Ta0nTlOHnLUNo1ksAojKY7FrhHzqRAqVA4lMtw=",
    "SHA-384" to "qjVsiK/b2KelqcMTNUGvADXksE6CQ4oiOqGTkkDMtrPKKClLWsD0JwOxUYP0wBb8",
    "SHA-512" to "8ZJPPmGqxOTKp/1WZZG4q7VBsOZCzXvwxxVzJnz6zxttr+kFvW5CYzv7pnxZd04HAJXhmnwgeKwYzNIyRddvHA==",
    "MD2" to "+4UyPDsVsBbgNRAG4vR79w==",
    "MD4" to "LTYJl5TsGCy7NtAuEYj8Hg==",
    "MD5" to "wp8j8nkSZ1e6GOx00NJ8+g=="
  )
)
