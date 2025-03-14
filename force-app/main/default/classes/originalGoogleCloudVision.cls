public with sharing class originalGoogleCloudVision {
    private static final String API_URL = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyC8qdA0XW4jOszT9cozJYz1pgg5TwcYXxM'; // API 키를 여기에 직접 입력 (**주의: 보안 취약점**)

    @AuraEnabled(cacheable=true)
    public static String annotateImage(String base64Image) {
        HttpRequest request = createHttpRequest(base64Image);

        try {
            Http http = new Http();
            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200) {
                return parseResponse(response.getBody());
            } else {
                return 'Error: ' + response.getStatusCode() + ' - ' + response.getBody();
            }

        } catch (Exception e) {
            return 'Error: ' + e.getMessage();
        }
    }

    private static HttpRequest createHttpRequest(String base64Image) {
        HttpRequest request = new HttpRequest();
        request.setEndpoint(API_URL);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');

        Map<String, Object> requestBody = new Map<String, Object>();
        List<Object> requests = new List<Object>();
        Map<String, Object> req = new Map<String, Object>();
        Map<String, Object> image = new Map<String, Object>();
        image.put('content', base64Image);
        Map<String, Object> features = new Map<String, Object>();
        features.put('type', 'TEXT_DETECTION');
        List<Object> featureList = new List<Object>();
        featureList.add(features);
        req.put('image', image);
        req.put('features', featureList);
        requests.add(req);
        requestBody.put('requests', requests);

        String jsonBody = JSON.serialize(requestBody);
        request.setBody(jsonBody);

        return request;
    }

    private static String parseResponse(String responseBody) {
        try {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(responseBody);
            List<Object> responses = (List<Object>) responseMap.get('responses');

            if (responses != null && !responses.isEmpty()) {
                Map<String, Object> firstResponse = (Map<String, Object>) responses.get(0);
                List<Object> textAnnotations = (List<Object>) firstResponse.get('textAnnotations');

                if (textAnnotations != null && !textAnnotations.isEmpty()) {
                    String extractedText = '';
                    for (Object annotation : textAnnotations) {
                        Map<String, Object> textAnnotation = (Map<String, Object>) annotation;
                        String description = (String) textAnnotation.get('description');
                        extractedText += description + ' ';
                    }
                    return extractedText.trim();
                } else {
                    return 'No text annotations found.';
                }
            } else {
                return 'No responses found.';
            }
        } catch (JSONException e) {
            return 'Error parsing JSON response: ' + e.getMessage();
        }
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, String> extractBusinessInfo(String base64Image) {
        String extractedText = annotateImage(base64Image); // OCR 수행

        Map<String, String> businessInfo = new Map<String, String>();

        // 정규 표현식을 사용하여 정보 추출
        businessInfo.put('등록번호', extractValue(extractedText, '등록번호\\s*:\\s*(\\d{3}-\\d{2}-\\d{5})').replaceAll('-', '')); // 하이픈 제거
        businessInfo.put('법인명', extractValue(extractedText, '법인명\\(단체명\\)\\s*:\\s*(.+)'));
        businessInfo.put('대표자', extractValue(extractedText, '대표자\\s*:\\s*(.+)'));
        businessInfo.put('개업연월일', extractValue(extractedText, '개업연월일\\s*:\\s*(\\d{4}\\s*년\\s*\\d{2}\\s*월\\s*\\d{2}\\s*일)'));

        return businessInfo;
    }

    private static String extractValue(String text, String regex) {
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }
}