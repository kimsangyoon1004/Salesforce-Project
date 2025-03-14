public with sharing class BusinessValidationController {
    private static final String API_URL = 'https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=uiV1EXkvNDkrSCaFsCuYKvK7cMY6GTBFsGFcWKC4uSRCZ9hy%2Bs%2B7x4Kmjwb6x%2B0CSbKbDGOGbU7eYf%2BM%2Fq%2BpOA%3D%3D';

    @AuraEnabled
    public static String validateBusiness(String recordId) {
        try {
            // 1️⃣ OCR에서 추출한 정보 가져오기
            Lead lead = [SELECT Id, Extracted_Text__c, Verification_Status__c FROM Lead WHERE Id = :recordId LIMIT 1];

            if (String.isEmpty(lead.Extracted_Text__c)) {
                return '❌ OCR 데이터 없음';
            }

            // 2️⃣ JSON 데이터 파싱 (사업자등록번호, 대표자명, 개업연월일 추출)
            Map<String, Object> extractedData = (Map<String, Object>) JSON.deserializeUntyped(lead.Extracted_Text__c);
            String businessNo = (String) extractedData.get('등록번호');
            String repName = (String) extractedData.get('대표자');
            String startDate = ((String) extractedData.get('개업연월일')).replaceAll('[^0-9]', ''); // 숫자만 추출

            if (String.isEmpty(businessNo) || String.isEmpty(repName) || String.isEmpty(startDate)) {
                return '❌ 필수 정보 누락';
            }

            // 3️⃣ API 요청 데이터 구성
            String requestBody = '{"businesses": [{"b_no": "' + businessNo + '", "start_dt": "' + startDate + '", "p_nm": "' + repName + '"}]}';
            System.debug('🔍 [API 요청 데이터]: ' + requestBody);

            // 4️⃣ API 호출
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(API_URL);
            request.setMethod('POST');
            request.setHeader('Content-Type', 'application/json');
            request.setBody(requestBody);

            HttpResponse response = http.send(request);
            System.debug('🔍 [API 응답 상태 코드]: ' + response.getStatusCode());
            System.debug('🔍 [API 응답 본문]: ' + response.getBody());

            if (response.getStatusCode() == 200) {
                // 5️⃣ API 응답 파싱
                Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                List<Object> businesses = (List<Object>) responseBody.get('data');

                if (businesses == null || businesses.isEmpty()) {
                    lead.Verification_Status__c = '❌ 응답 데이터 없음';
                    update lead;
                    return '❌ 응답 데이터 없음';
                }

                Map<String, Object> businessStatus = (Map<String, Object>) businesses[0];
                Map<String, Object> statusInfo = (Map<String, Object>) businessStatus.get('status');

                // 6️⃣ `b_stt_cd` 값 가져오기
                if (statusInfo != null && statusInfo.containsKey('b_stt_cd')) {
                    String statusCode = (String) statusInfo.get('b_stt_cd');
                    System.debug('🔍 [API 응답 - b_stt_cd 값]: ' + statusCode);

                    if (statusCode == '01') {
                        lead.Verification_Status__c = '✅ 일치 - 존재함';
                        update lead;
                        return '✅ 일치 - 존재하는 사업자';
                    } else {
                        lead.Verification_Status__c = '❌ 존재하지 않음';
                        update lead;
                        return '❌ 존재하지 않는 사업자';
                    }
                } else {
                    lead.Verification_Status__c = '❌ 존재하지 않음';
                    update lead;
                    return '❌ 존재하지 않음';
                }
            } else {
                return '❌ API 오류: ' + response.getStatusCode();
            }
        } catch (Exception e) {
            System.debug('❌ [API 처리 중 오류 발생]: ' + e.getMessage());
            return '❌ 시스템 오류 발생: ' + e.getMessage();
        }
    }
}