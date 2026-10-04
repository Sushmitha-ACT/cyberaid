import 'dotenv/config';
import { prisma } from './src/lib/prisma';

const categoryTemplates = {
  'Account Recovery': {
    description: "A comprehensive, step-by-step guide to recovering your compromised account securely and swiftly.",
    content: `## 1. Immediate Action Required
If you suspect your account has been compromised, time is of the essence.
- **Do not panic**, but act immediately.
- Attempt to log in. If you can still log in, go straight to security settings and change your password.
- If you cannot log in, proceed to the platform's official account recovery page.

## 2. The Recovery Process
- **Use Trusted Devices:** Always attempt recovery from a device and Wi-Fi network you have used previously to log into this account. Platforms track device IDs and IP addresses to verify identity.
- **Provide Information:** You will be asked for previous passwords, recovery email addresses, or phone numbers. Provide as much accurate information as possible.
- **Identity Verification:** Some platforms require you to upload a government-issued ID or take a video selfie. Ensure your lighting is good and the ID is fully visible.

## 3. Post-Recovery Security
Once you regain access, you must secure the account to prevent a repeat incident:
1. **Enable Two-Factor Authentication (2FA):** Use an authenticator app (like Google Authenticator or Authy) rather than SMS if possible.
2. **Review Active Sessions:** Force log out of all other devices currently connected to your account.
3. **Check for Backdoors:** Look in your account settings for any unrecognized email forwarding rules, linked apps, or secondary recovery emails the attacker may have added.

## Need More Help?
If the official recovery steps fail, document everything and try reaching out to the platform's support team on Twitter or through their official appeal forms. Stay vigilant against "recovery experts" who ask for money—they are scammers.`
  },
  'Financial Fraud': {
    description: "Essential steps to secure your finances, reverse fraudulent transactions, and protect your identity.",
    content: `## 1. Stop the Bleeding
The moment you realize financial fraud has occurred, you must cut off the attacker's access.
- **Call your bank or credit card provider immediately.** Use the number on the back of your card, never a number found in a suspicious email.
- Ask them to freeze your accounts or cancel the compromised cards.
- If the fraud involved a wire transfer or crypto, contact the receiving institution immediately, though reversal may be difficult.

## 2. Document Everything
Before you delete any emails or close any tabs, gather evidence.
- Take screenshots of the fraudulent transactions, unauthorized account changes, and any communication with the scammer.
- Note the exact dates, times, and amounts involved.
- This documentation will be crucial for police reports and bank fraud claims.

## 3. Report and Recover
- **File a Police Report:** Even if local police cannot recover the funds, having an official report is often required by banks to process a fraud claim.
- **Fraud Alerts:** Place a fraud alert on your credit file with the three major credit bureaus (Equifax, Experian, TransUnion).
- **Update Security:** Change passwords for all your financial accounts. Do not reuse passwords. Enable 2FA on every banking or investment account.

## Prevention Tips
Never share OTPs (One Time Passwords) over the phone. Banks will never call you and ask for your password or verification codes.`
  },
  'Device Security': {
    description: "Learn how to detect, remove, and prevent malware, spyware, and unauthorized access on your devices.",
    content: `## 1. Disconnect and Isolate
If you believe your device is compromised by malware or a hacker:
- **Disconnect from the internet.** Turn off Wi-Fi, unplug Ethernet cables, and enable Airplane mode. This stops the attacker from exfiltrating data or sending further commands to the malware.
- Do not plug the device into any other computers or external hard drives, as the infection could spread.

## 2. Scan and Clean
- **Run a Full Scan:** Use reputable, built-in security software (like Windows Defender or Malwarebytes) to perform a full system scan.
- **Review Installed Apps:** Go through your installed applications and browser extensions. Delete anything you don't recognize or didn't install yourself.
- **Check Permissions:** On mobile devices, review which apps have access to your camera, microphone, and location. Revoke permissions for suspicious apps.

## 3. The Nuclear Option: Factory Reset
If the infection persists or you want to be 100% sure the device is clean:
- **Backup Important Files:** Only backup documents and photos. Do not backup applications or executables, as they may be infected.
- **Factory Reset:** Wipe the device completely and reinstall the operating system from scratch.

## Long-Term Protection
Keep your operating system and all applications updated. Most updates contain critical security patches that protect against newly discovered vulnerabilities.`
  },
  'Privacy': {
    description: "Actionable strategies to reclaim your personal data, block tracking, and enhance your digital privacy.",
    content: `## 1. Assess Your Digital Footprint
Your personal information is likely scattered across the web.
- **Search Yourself:** Use search engines to look up your name, phone number, and address to see what information is publicly available.
- **Check for Breaches:** Use services like HaveIBeenPwned to see if your data has been exposed in known corporate data breaches.

## 2. Reclaim Your Data
- **Data Brokers:** Companies collect and sell your data. You can manually opt-out of major data brokers (like Whitepages, Spokeo, and Intelius) or use a paid service to remove your data automatically.
- **Social Media:** Review the privacy settings on all your social media accounts. Set your profiles to private and restrict who can see your posts and personal details.
- **Delete Unused Accounts:** If you no longer use a service, delete the account entirely rather than just abandoning it.

## 3. Enhance Daily Privacy
- **Use a Tracker Blocker:** Install browser extensions like uBlock Origin or Privacy Badger to block invisible tracking scripts.
- **Switch Browsers:** Consider using privacy-focused browsers like Firefox or Brave instead of Chrome.
- **Limit Permissions:** Only give apps the permissions they strictly need to function. (e.g., A calculator app doesn't need your location).

## Ongoing Vigilance
Privacy is not a one-time setup; it's a habit. Regularly review your privacy settings and be mindful of what you share online.`
  },
  'Phishing & Scams': {
    description: "Learn how to identify deceptive tactics, handle phishing attempts, and avoid falling victim to online scams.",
    content: `## 1. Recognizing the Threat
Phishing and scams rely on psychological manipulation. Watch out for:
- **Urgency or Fear:** "Your account will be suspended in 24 hours!"
- **Greed:** "You've won a gift card! Click here to claim."
- **Authority:** Someone claiming to be from the IRS, FBI, or your bank's fraud department.
- **Suspicious Links:** Hover over links without clicking to see the actual destination URL. Look for subtle misspellings (e.g., paypa1.com instead of paypal.com).

## 2. What to Do If You Clicked
If you clicked a phishing link but didn't enter any information:
- Disconnect from the internet immediately.
- Run a full antivirus scan on your device.
- Clear your browser cache and cookies.

If you entered your password:
- Immediately go to the real website and change your password.
- If you use that password anywhere else, change it there too.
- Enable Two-Factor Authentication.

## 3. Reporting and Prevention
- **Report the Phishing:** Forward phishing emails to the Anti-Phishing Working Group (reportphishing@apwg.org) or use your email provider's built-in "Report Phishing" button.
- **Educate Yourself:** Stay updated on the latest scam trends. Scammers constantly evolve their tactics, from romance scams to tech support popups.

## The Golden Rule
Never trust caller ID or the "From" address in an email, as both can be easily spoofed. If in doubt, contact the organization directly using a verified phone number or website.`
  }
};

async function main() {
  const guides = await prisma.guide.findMany();
  console.log('Found ' + guides.length + ' guides to update with realistic templates.');
  
  for (let i = 0; i < guides.length; i++) {
    const guide = guides[i];
    const template = categoryTemplates[guide.category] || categoryTemplates['Account Recovery'];
    
    // Customize the template slightly for the specific title
    const customizedContent = "# " + guide.title + "\n\n" + template.content;
    const customizedDescription = template.description;
    
    await prisma.guide.update({
      where: { id: guide.id },
      data: { 
        description: customizedDescription, 
        content: customizedContent 
      }
    });
    console.log("Updated " + (i+1) + "/" + guides.length + ": " + guide.title);
  }
  
  console.log('Successfully updated all resources with realistic content!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
