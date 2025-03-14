public with sharing class BusinessVerificationService {
    private static final String API_URL = 'https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=uiV1EXkvNDkrSCaFsCuYKvK7cMY6GTBFsGFcWKC4uSRCZ9hy%2Bs%2B7x4Kmjwb6x%2B0CSbKbDGOGbU7eYf%2BM%2Fq%2BpOA%3D%3D';

    @AuraEnabled(cacheable=false)
    public static String verifyBusinessNumber(String businessNumber) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(API_URL);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json; charset=UTF-8');

        //  올바른 JSON 요청 형식 적용
        String requestBody = '{"b_no": ["' + businessNumber + '"]}';
        request.setBody(requestBody);

        try {
            HttpResponse response = http.send(request);
            System.debug('API Response: ' + response.getBody());

            if (response.getStatusCode() == 200) {
                Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                List<Object> businesses = (List<Object>) result.get('data');

                if (businesses != null && !businesses.isEmpty()) {
                    Map<String, Object> businessInfo = (Map<String, Object>) businesses[0];
                    String statusCode = (String) businessInfo.get('b_stt_cd'); //  사업자 상태 코드 확인

                    System.debug('Business Status Code: ' + statusCode);

                    // "01"이면 정상 사업자
                    if (statusCode == '01') {
                        return 'Approved';
                    } else {
                        return 'Rejected';
                    }
                } else {
                    return 'Rejected';
                }
            } else {
                System.debug('API error: ' + response.getStatusCode() + ' ' + response.getStatus());
                return 'Error: ' + response.getStatusCode() + ' ' + response.getStatus();
            }
        } catch (Exception e) {
            System.debug('Exception: ' + e.getMessage());
            return 'Error: ' + e.getMessage();
        }
    }
}