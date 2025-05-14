public with sharing class OCRFlowHandler {
    @InvocableMethod(label='Execute OCR' description='Runs OCR on the Business Certification Image')
    public static List<String> executeOCR(List<Id> leadIds) { //  List<String> 반환으로 변경
        List<String> extractedTexts = new List<String>();

        for (Id leadId : leadIds) {
            Lead lead = [SELECT Id, Business_Certification_Image__c FROM Lead WHERE Id = :leadId LIMIT 1];

            if (lead.Business_Certification_Image__c != null) {
                String extractedText = GoogleCloudVision.extractFilteredText(lead.Business_Certification_Image__c);

                //  OCR 결과를 리드에 저장
                lead.Extracted_text__c = extractedText;
                update lead;

                extractedTexts.add(extractedText);
            }
        }

        return extractedTexts; //  Flow에서 처리 가능하도록 반환 타입을 List<String>으로 변경
    }
}