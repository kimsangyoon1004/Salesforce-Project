public with sharing class GoogleCloudVision {
    private static final String API_URL = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyC8qdA0XW4jOszT9cozJYz1pgg5TwcYXxM';

    @AuraEnabled(cacheable=true)
    public static String extractFilteredText(String imageUrl) {
        String extractedText = annotateImage(imageUrl);
        return filterBusinessInfo(extractedText);
    }

    @AuraEnabled(cacheable=true)
    public static String annotateImage(String imageUrl) {
        HttpRequest request = createHttpRequest(imageUrl);

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

    private static HttpRequest createHttpRequest(String imageUrl) {
        HttpRequest request = new HttpRequest();
        request.setEndpoint(API_URL);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');

        Map<String, Object> requestBody = new Map<String, Object>();
        List<Object> requests = new List<Object>();
        Map<String, Object> req = new Map<String, Object>();

        Map<String, Object> image = new Map<String, Object>();
        image.put('source', new Map<String, Object>{ 'imageUri' => imageUrl });

        List<Object> featureList = new List<Object>();
        Map<String, Object> features = new Map<String, Object>();
        features.put('type', 'TEXT_DETECTION');
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
                if (firstResponse.containsKey('fullTextAnnotation')) {
                    Map<String, Object> fullTextAnnotation = (Map<String, Object>) firstResponse.get('fullTextAnnotation');
                    if (fullTextAnnotation.containsKey('text')) {
                        return (String) fullTextAnnotation.get('text');
                    }
                }
            }
            return 'No text extracted.';
        } catch (Exception e) {
            return 'Error parsing JSON response: ' + e.getMessage();
        }
    }

    private static String filterBusinessInfo(String text) {
        if (String.isEmpty(text)) return 'OCR 실패';
    
        Map<String, String> businessInfo = new Map<String, String>();
    
        // 등록번호 추출 (하이픈 제거)
        businessInfo.put('등록번호', extractValue(text, '등록번호\\s*[:\\-]\\s*(\\d{3}-\\d{2}-\\d{5})').replaceAll('-', ''));
    
        // 법인명 또는 상호 추출 (둘 중 하나라도 있으면 가져오기)
        businessInfo.put('법인명', extractValue(text, '(?:법인명\\(단체명\\)|상호)\\s*[:\\-]?\\s*([^\n]+)'));
    
        // 대표자명 추출 ("성명" 또는 "대표자" 둘 다 대응)
        businessInfo.put('대표자', extractValue(text, '(?:성명|대표자)\\s*[:\\-]?\\s*([^\n]+)'));
    
        // 개업연월일 추출 (YYYY년 MM월 DD일 형식)
        businessInfo.put('개업연월일', extractValue(text, '개업연월일\\s*[:\\-]?\\s*(\\d{4}\\s*년\\s*\\d{2}\\s*월\\s*\\d{2}\\s*일)'));
    
        return JSON.serialize(businessInfo);
    }

    private static String extractValue(String text, String regex) {
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return '정보 없음';
    }
}