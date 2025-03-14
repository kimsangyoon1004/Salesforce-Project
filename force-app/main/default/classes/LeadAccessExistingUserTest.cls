@isTest
private class LeadAccessExistingUserTest {
    @isTest
    static void testExistingUserLeadAccess() {
        // Step 1: Query an existing user (change this to match a real user's profile)
        User existingUser = [SELECT Id FROM User WHERE Profile.Name = 'Standard User' LIMIT 1];

        // Step 2: Run the SOQL query as that user
        System.runAs(existingUser) {
            List<Lead> leads = [SELECT Id, Name FROM Lead LIMIT 10];
            System.debug('Leads visible to ' + existingUser.Id + ': ' + leads);
            System.assert(leads.size() > 0, 'User should have access to at least some leads');
        }
    }
}