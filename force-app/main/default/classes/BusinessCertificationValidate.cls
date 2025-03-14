public with sharing class BusinessCertificationValidate {
    private static final String API_URL = 'https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=uiV1EXkvNDkrSCaFsCuYKvK7cMY6GTBFsGFcWKC4uSRCZ9hy%2Bs%2B7x4Kmjwb6x%2B0CSbKbDGOGbU7eYf%2BM%2Fq%2BpOA%3D%3D';

    @AuraEnabled(cacheable=false)
    public static String verifyBusinessNumber(String businessNumber, String startDate, String ownerName) {
        HttpRequest request = new HttpRequest();
        request.setEndpoint(API_URL);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');

        Map<String, Object> requestBody = new Map<String, Object>();
        requestBody.put('businesses', new List<Map<String, Object>>{
            new Map<String, Object>{
                'b_no' => businessNumber,
                'start_dt' => startDate,
                'p_nm' => ownerName
            }
        });

        request.setBody(JSON.serialize(requestBody));

        try {
            Http http = new Http();
            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200) {
                Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                List<Object> businesses = (List<Object>) result.get('data');
                if (!businesses.isEmpty() && ((Map<String, Object>) businesses[0]).get('b_stt_cd') == '01') {
                    return 'Approved';
                }
            }
            return 'Rejected';
        } catch (Exception e) {
            return 'Error: ' + e.getMessage();
        }
    }
}