public class ImageSharpnessJob implements Queueable, Database.AllowsCallouts {
    private String recordId;

    public ImageSharpnessJob(String recordId) {
        this.recordId = recordId;
    }

    public void execute(QueueableContext context) {
        try {
            Lead lead = [SELECT Id, Business_Certification_Image__c FROM Lead WHERE Id = :recordId LIMIT 1];

            if (String.isEmpty(lead.Business_Certification_Image__c)) {
                System.debug('❌ [오류] 이미지 URL 없음');
                return;
            }

            String result = ImageSharpnessEvaluator.evaluateImageSharpness(lead.Id, lead.Business_Certification_Image__c);

            lead.Image_Sharpness__c = result;
            update lead;

            System.debug('✅ [완료] 이미지 분석 결과: ' + result);

        } catch (Exception e) {
            System.debug('❌ [오류] 이미지 분석 실패: ' + e.getMessage());
        }
    }
}