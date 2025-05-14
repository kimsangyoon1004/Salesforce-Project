public with sharing class GoogleAuthService {
    private static final String TOKEN_URL = 'https://oauth2.googleapis.com/token';

    @AuraEnabled(cacheable=true)
    public static String getGoogleAccessToken() {
        try {
            String clientEmail = 'kimeric@derful.iam.gserviceaccount.com';
            String privateKey = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDNbyBJcio+KUwZ\nh2gJq3x45fcxCoIPbNacu8zNcAWgYybWzw1W4n7oTbZj76Q2Ym5RpzoJXuaop+qQ\nN0MIF/HD5MZhe9YU7MVoBFSWfhLKB2/z1/MfrKNpWYdjb6n/LCBoOkIejuX8cUUM\nwFvwECdR5sYl3Hw4fHoX6bN00ClegCa00xvtX6zTEJHG3Zo8xROIf5I2Vt/nidEa\n2BNEofPJv16ljTd6YCEmrluUMAfWzzpDelPGkhBCn3Z7rdB914DZBCieY5NWzwe6\n4uhap0XV6ty8P8JNdVEP/CDAyD7Gdw9ZsT9X5U4sNpQ24fp1VHyWtK2B4PTxBTSX\nR8BLURlLAgMBAAECggEAUlK6XwRLbk6RSteqttlMD4ykIrhhxzmnxPYzC45dCtlA\n6qrdXxhzn7bopKKXLR4DtF/tj2zCxQpJIpKqn3cs8IHgh5cfApKhRt4ZYZdTAze4\nwsAikupVL7XrXcsVFgcCU5IpBeLgwelIMORy00A96YGvnON+ugoTyTpjKifytAWx\nRIapn5iqu6FzSCnMKybapLGBDQKgOZeS6J3G+UYWYEzF90zxwap5YV8zwm/mvEBQ\n+LgJzZq6TSRRrVZLUxBk0NnZ6iAmACdmNWPwwdQAMceUcgwGjaASfH9Tvt153LUx\ngVP22ipZZUJmbGOLGvXnBi/pGPH8M7zXJxElN0z5dQKBgQD5zMsZAGd/FtZIFQZ3\n1otThO1VcAe779yMnFxYm0ARzydg5weUEBrhsWhHZ2D5Of5Xq59xvAjGVH9E23L5\nqU8awVKEKT5LawZ1AAkSyHpjQlKtjr6rUWXjR97fhdXWyx3yeCQt5PMm25N+vnyn\n6p3ZMjLeKbNzUPSY9dFDnbh6NwKBgQDSiG+W5hCyJUl7BuI9Go78fQvPDw9GoNnO\nEmJKoqBnPIflI+T+uxnz7eL3ptvTLxmK6DSdlhWpepHsKDiIQostll+4RmUVYsPv\nQKqa4xG+BRCywaGVOKLpOfR/RJNUUt9cidiXheS/9WoxvGV2vXNJUVf5iLh/eAVP\nthsLrE//jQKBgQCt4IFWi9N+wTSyw//Wlr4wioxxNiQMC3AnaAdXnelA/ELazrWV\nuIgdpVGCslDr6hRCjjHUByDMfLCCC4bChbmMVBjN6a9067B47GdkbavTP60xJfVO\nZsBXLgXS7OPmOUhFKJ92WrFt0NWgGZPHhiYNs0V5IunIUQeRGTpqqHRqjQKBgQC0\nKnX0WKXpDee4FMf/Kn86q3gzlduowXYi17Ct1kYWksJo4TLSmyM2kFkvPefY7fGZ\n4eVFBm87Pd0qj7DxSqD4Pjtj4zoV9xNd56UYL0G7r3H+x52TqYggtqv5TaIXA2SK\nOJzV7os3irl6HpNl7fJ+x9HVhZ791qQU9u5mKuu68QKBgDIFgtoJtnI9bEcRUoWn\nMk3Q87QoSxy+0wJE2/RKxLbWIAg7BNiDIS2HtJgzkUtINE+oHSDi3hvb3vfMQI+b\nhVVxm8oKJYCbib4P4sUbuhqOkfZMjm1hCn//9yavq0beW3Q+tYY9O0ajxPESQe+V\now6hO70EqeEdQXLYzJUYDvae\n-----END PRIVATE KEY-----\n';

            //  Private Key에서 BEGIN/END 제거
            privateKey = privateKey.replace('-----BEGIN PRIVATE KEY-----\n', '')
                                   .replace('\n-----END PRIVATE KEY-----\n', '')
                                   .replace('\n', '')
                                   .trim(); 

            //  JWT 생성
            String assertion = createJWT(clientEmail, privateKey);
            System.debug(' [JWT Assertion] ' + assertion);

            //  HTTP 요청 데이터
            String requestBody = 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + assertion;
            System.debug(' [OAuth 요청 데이터] ' + requestBody);

            //  HTTP 요청 생성
            HttpRequest req = new HttpRequest();
            req.setEndpoint(TOKEN_URL);
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            req.setBody(requestBody);

            //  HTTP 요청 실행
            Http http = new Http();
            HttpResponse res = http.send(req);
            System.debug(' [OAuth 응답] 상태 코드: ' + res.getStatusCode());
            System.debug(' [OAuth 응답 본문] ' + res.getBody());

            if (res.getStatusCode() == 200) {
                Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                return (String) responseBody.get('access_token'); //  Access Token 반환
            } else {
                throw new AuraHandledException('Google OAuth 오류: ' + res.getBody());
            }
        } catch (Exception e) {
            throw new AuraHandledException('Access Token 가져오기 실패: ' + e.getMessage());
        }
    }
    private static String createJWT(String clientEmail, String privateKey) {
        Long iat = DateTime.now().getTime() / 1000;
        Long exp = iat + 3600; // 1시간 유효
    
        Map<String, Object> header = new Map<String, Object>{
            'alg' => 'RS256',
            'typ' => 'JWT'
        };
    
        Map<String, Object> payload = new Map<String, Object>{
            'iss' => clientEmail,
            'scope' => 'https://www.googleapis.com/auth/devstorage.full_control',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => exp,
            'iat' => iat
        };
    
        //  Base64 URL-Safe 인코딩 적용
        String encodedHeader = base64UrlEncode(Blob.valueOf(JSON.serialize(header)));
        String encodedPayload = base64UrlEncode(Blob.valueOf(JSON.serialize(payload)));
    
        //  Private Key는 Base64 디코딩하지 않고 Blob.valueOf 사용
        String signatureBase = encodedHeader + '.' + encodedPayload;
        Blob privateKeyBlob = EncodingUtil.base64Decode(privateKey); //  올바르게 Base64 디코딩
        Blob signature = Crypto.sign('RSA-SHA256', Blob.valueOf(signatureBase), privateKeyBlob);
        String encodedSignature = base64UrlEncode(signature);
    
        return signatureBase + '.' + encodedSignature;
    }
    private static String base64UrlEncode(Blob inputBlob) {
        String encoded = EncodingUtil.base64Encode(inputBlob);
        //  Google 표준 Base64 URL-Safe 변환 적용
        encoded = encoded.replace('+', '-').replace('/', '_').replace('=', '');
        return encoded;
    }
}