public with sharing class AddressSearch {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getAddress(String address) { 
        String confirmKey = 'devU01TX0FVVEgyMDI1MDMwNzA5NDk1MzExNTUyOTE='; 
        Integer countPerPage = 200; // 페이지당 보여줄 주소 개수 

        try {
            String apiUrl = 'https://www.juso.go.kr/addrlink/addrLinkApi.do?currentPage=1&countPerPage=' + countPerPage + '&keyword=' + EncodingUtil.urlEncode(address, 'UTF-8') + '&confmKey=' + confirmKey + '&resultType=json'; // currentPage=1로 고정

            HttpRequest req = new HttpRequest();
            req.setEndpoint(apiUrl);
            req.setMethod('GET');

            Http http = new Http();
            HttpResponse res = http.send(req);

            // API 응답 결과 처리
            if (res.getStatusCode() == 200) {
                Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                return response;
            } else {
                // 오류 처리
                System.debug('API Error: ' + res.getStatusCode() + ' - ' + res.getStatus());
                throw new AuraHandledException('주소 검색 API 호출 중 오류가 발생했습니다. (오류 코드: ' + res.getStatusCode() + ')');
            }

        } catch (Exception e) {
            System.debug('Exception: ' + e.getMessage());
            throw new AuraHandledException('주소 검색 중 오류가 발생했습니다. ' + e.getMessage());
        }
    }
}