public with sharing class ImageSharpnessEvaluator {
    private static final String CLOUD_RUN_API_URL = 'https://clearblur-serving-965266470542.asia-northeast3.run.app/predict';

    @AuraEnabled
    public static String evaluateImageSharpness(String recordId, String imageUrl) {
        if (String.isEmpty(imageUrl)) {
            return 'Error: 이미지 URL이 제공되지 않았습니다.';
        }

        String fileName = extractFileName(imageUrl);
        if (String.isEmpty(fileName)) {
            return 'Error: 파일명을 추출할 수 없습니다.';
        }

        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(CLOUD_RUN_API_URL);
            request.setMethod('POST');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeout(120000); // ⏳ 타임아웃을 120초로 증가

            String requestBody = '{"image_url": "' + fileName + '"}';
            request.setBody(requestBody);

            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                Map<String, Object> responseData = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                String prediction = (String) responseData.get('prediction');
                String status = prediction == 'clear' ? '선명함' : '선명하지 않음';

                if (recordId != null) {
                    Lead leadToUpdate = [SELECT Id, Image_Sharpness__c FROM Lead WHERE Id = :recordId LIMIT 1];
                    leadToUpdate.Image_Sharpness__c = status;
                    update leadToUpdate;
                }

                return status;
            } else {
                return 'Error: ' + response.getStatusCode() + ' - ' + response.getBody();
            }
        } catch (Exception e) {
            return 'Error: ' + e.getMessage();
        }
    }

    private static String extractFileName(String imageUrl) {
        if (String.isEmpty(imageUrl)) return '';
        List<String> urlParts = imageUrl.split('/');
        if (urlParts.isEmpty()) return '';
        return urlParts[urlParts.size() - 1];
    }
}