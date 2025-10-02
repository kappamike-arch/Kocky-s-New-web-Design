#!/usr/bin/env node

/**
 * Test Email Template Rendering
 * 
 * This script tests the email template rendering functionality
 * to isolate template issues from email sending issues.
 */

require('dotenv').config({ path: './.env' });

async function testRenderTemplate() {
  console.log("🧪 TESTING EMAIL TEMPLATE RENDERING");
  console.log("====================================\n");

  try {
    // Test 1: Import template function
    console.log("1. Testing template function import...");
    const { getEmailTemplate } = require('./dist/utils/email');
    console.log("   ✅ Template function imported successfully");

    // Test 2: Test quote template rendering
    console.log("\n2. Testing quote template rendering...");
    const quoteData = {
      customerName: 'John Doe',
      quoteNumber: 'Q-2025-001',
      serviceType: 'Catering Services',
      eventDate: 'March 15, 2025',
      validUntil: 'February 15, 2025',
      subtotal: '500.00',
      tax: '45.00',
      gratuity: '50.00',
      total: '595.00',
      deposit: '119.00',
      stripePaymentLink: 'https://checkout.stripe.com/test-session',
      unsubscribeLink: 'https://staging.kockys.com/unsubscribe?email=test@example.com'
    };

    console.log("   📋 Quote data for template:");
    console.log(`   • Customer: ${quoteData.customerName}`);
    console.log(`   • Quote Number: ${quoteData.quoteNumber}`);
    console.log(`   • Service Type: ${quoteData.serviceType}`);
    console.log(`   • Total: $${quoteData.total}`);
    console.log(`   • Deposit: $${quoteData.deposit}`);
    console.log(`   • Stripe Link: ${quoteData.stripePaymentLink ? '✅ Present' : '❌ Missing'}`);

    const template = getEmailTemplate('quote', quoteData);

    // Test 3: Validate template content
    console.log("\n3. Validating template content...");
    const validations = {
      hasHtml: !!template.html,
      hasText: !!template.text,
      htmlLength: template.html?.length || 0,
      textLength: template.text?.length || 0,
      hasCustomerName: template.html?.includes(quoteData.customerName) || false,
      hasQuoteNumber: template.html?.includes(quoteData.quoteNumber) || false,
      hasServiceType: template.html?.includes(quoteData.serviceType) || false,
      hasTotal: template.html?.includes(quoteData.total) || false,
      hasDeposit: template.html?.includes(quoteData.deposit) || false,
      hasStripeLink: template.html?.includes(quoteData.stripePaymentLink) || false,
      hasPayNowButton: template.html?.includes('Pay Now') || false,
      hasQuoteBreakdown: template.html?.includes('Quote Breakdown') || false,
      hasKockysBranding: template.html?.includes("Kocky's") || false
    };

    console.log("   📊 Template Validation Results:");
    console.log(`   • Has HTML: ${validations.hasHtml ? '✅' : '❌'}`);
    console.log(`   • Has Text: ${validations.hasText ? '✅' : '❌'}`);
    console.log(`   • HTML Length: ${validations.htmlLength} characters`);
    console.log(`   • Text Length: ${validations.textLength} characters`);
    console.log(`   • Customer Name: ${validations.hasCustomerName ? '✅' : '❌'}`);
    console.log(`   • Quote Number: ${validations.hasQuoteNumber ? '✅' : '❌'}`);
    console.log(`   • Service Type: ${validations.hasServiceType ? '✅' : '❌'}`);
    console.log(`   • Total Amount: ${validations.hasTotal ? '✅' : '❌'}`);
    console.log(`   • Deposit Amount: ${validations.hasDeposit ? '✅' : '❌'}`);
    console.log(`   • Stripe Link: ${validations.hasStripeLink ? '✅' : '❌'}`);
    console.log(`   • Pay Now Button: ${validations.hasPayNowButton ? '✅' : '❌'}`);
    console.log(`   • Quote Breakdown: ${validations.hasQuoteBreakdown ? '✅' : '❌'}`);
    console.log(`   • Kocky's Branding: ${validations.hasKockysBranding ? '✅' : '❌'}`);

    // Test 4: Check for critical components
    console.log("\n4. Checking critical components...");
    const criticalComponents = [
      'Customer Name',
      'Quote Number', 
      'Total Amount',
      'Stripe Link',
      'Pay Now Button',
      'Quote Breakdown',
      'Kocky\'s Branding'
    ];

    const missingComponents = criticalComponents.filter(component => {
      switch (component) {
        case 'Customer Name': return !validations.hasCustomerName;
        case 'Quote Number': return !validations.hasQuoteNumber;
        case 'Total Amount': return !validations.hasTotal;
        case 'Stripe Link': return !validations.hasStripeLink;
        case 'Pay Now Button': return !validations.hasPayNowButton;
        case 'Quote Breakdown': return !validations.hasQuoteBreakdown;
        case 'Kocky\'s Branding': return !validations.hasKockysBranding;
        default: return false;
      }
    });

    if (missingComponents.length === 0) {
      console.log("   ✅ All critical components present!");
    } else {
      console.log("   ❌ Missing critical components:");
      missingComponents.forEach(component => {
        console.log(`      • ${component}`);
      });
    }

    // Test 5: Save template to file for inspection
    console.log("\n5. Saving template to file for inspection...");
    const fs = require('fs');
    const path = require('path');
    
    const outputDir = path.join(__dirname, 'template-test-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const htmlFile = path.join(outputDir, 'quote-template.html');
    const textFile = path.join(outputDir, 'quote-template.txt');

    fs.writeFileSync(htmlFile, template.html);
    fs.writeFileSync(textFile, template.text);

    console.log(`   📁 HTML template saved to: ${htmlFile}`);
    console.log(`   📁 Text template saved to: ${textFile}`);

    // Final assessment
    const allCriticalPresent = missingComponents.length === 0;
    const hasReasonableLength = validations.htmlLength > 1000 && validations.textLength > 200;

    if (allCriticalPresent && hasReasonableLength) {
      console.log("\n✅ TEMPLATE RENDERING TEST SUCCESSFUL!");
      console.log("======================================");
      console.log("📧 Quote template is rendering correctly");
      console.log("🎯 All critical components are present");
      console.log("📏 Template has reasonable length");
      console.log("💳 Stripe payment link is included");
      console.log("📋 Quote breakdown is present");
      
      console.log("\n🎯 NEXT STEPS:");
      console.log("==============");
      console.log("1. Open the saved HTML file to preview the template");
      console.log("2. Verify the template looks correct");
      console.log("3. Run: npm run check:server to test full quote system");
      console.log("4. Use admin panel to send actual quote emails");
      
    } else {
      console.log("\n❌ TEMPLATE RENDERING TEST FAILED!");
      console.log("===================================");
      console.log("📧 Quote template has issues");
      
      if (!allCriticalPresent) {
        console.log("❌ Missing critical components");
      }
      if (!hasReasonableLength) {
        console.log("❌ Template length is insufficient");
      }
      
      console.log("\n🔧 TROUBLESHOOTING STEPS:");
      console.log("==========================");
      console.log("1. Check the saved template files for issues");
      console.log("2. Verify template data is being passed correctly");
      console.log("3. Check server logs for template rendering errors");
      console.log("4. Rebuild the project: npm run build");
    }

  } catch (error) {
    console.error("\n❌ TEMPLATE RENDERING TEST ERROR:");
    console.error("==================================");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    console.log("\n🔧 TROUBLESHOOTING STEPS:");
    console.log("==========================");
    console.log("1. Ensure project is built: npm run build");
    console.log("2. Check if template function exists in dist/utils/email.js");
    console.log("3. Verify template data structure");
    console.log("4. Check server logs for detailed errors");
  }
}

// Run the test
testRenderTemplate().catch(console.error);



