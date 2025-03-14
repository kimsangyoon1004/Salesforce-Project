trigger ImagesharpnessTrigger on Lead (after update) {
    for (Lead lead : Trigger.new) {
        Lead oldLead = Trigger.oldMap.get(lead.Id);

        // ✅ Status 값이 '1st Review' (API Name)로 변경될 경우 실행
        if (lead.Status == '1st Review' && oldLead.Status != '1st Review') {
            System.debug('✅ [트리거 실행] 1차 심사 상태 변경됨: ' + lead.Id);
            System.enqueueJob(new ImageSharpnessJob(lead.Id));
        }
    }
}
