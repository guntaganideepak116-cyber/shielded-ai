const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/Scanner.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Import
if (!content.includes("import { EmailReportSection }")) {
    content = content.replace(
        "import { HeaderAnalysis } from '@/components/HeaderAnalysis';",
        "import { HeaderAnalysis } from '@/components/HeaderAnalysis';\nimport { EmailReportSection } from '@/components/EmailReportSection';"
    );
}

// 2. Replace the UI block
// We search for the start of the section and the end of its parent container
const sectionStart = content.indexOf('<div className="email-report-section');
if (sectionStart !== -1) {
    // Find the next sibling (OWASP card) to know where to stop
    const sectionEnd = content.indexOf('{/* 3. OWASP Top 10 Card', sectionStart);
    
    if (sectionEnd !== -1) {
        const newSection = `                    <EmailReportSection 
                      user={user}
                      emailInput={emailInput}
                      setEmailInput={setEmailInput}
                      emailStatus={emailStatus}
                      emailMessage={emailMessage}
                      setEmailStatus={setEmailStatus}
                      setEmailMessage={setEmailMessage}
                      handleSendEmail={handleSendEmail}
                    />

`;
        content = content.substring(0, sectionStart) + newSection + content.substring(sectionEnd);
    }
}

fs.writeFileSync(filePath, content);
console.log('Successfully updated Scanner.tsx');
