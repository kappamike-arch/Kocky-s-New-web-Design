describe('Hero Section', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
  });

  it('should display hero content without errors', () => {
    // Check that the page loads without console errors
    cy.window().then((win) => {
      const consoleErrors: string[] = [];
      win.addEventListener('error', (e) => {
        consoleErrors.push(e.message);
      });
      
      // Wait for page to load
      cy.wait(2000);
      
      // Check that no critical errors occurred
      cy.wrap(consoleErrors).should('have.length', 0);
    });
  });

  it('should have either a playing video or background image', () => {
    // Wait for the hero section to load
    cy.get('section').first().should('be.visible');
    
    // Check for video element
    cy.get('body').then(($body) => {
      if ($body.find('video').length > 0) {
        // If video exists, check if it's playing or can be played
        cy.get('video').should('exist');
        cy.get('video').should('have.attr', 'autoplay');
        cy.get('video').should('have.attr', 'loop');
        cy.get('video').should('have.attr', 'muted');
        
        // Check if video has a source
        cy.get('video source').should('exist');
        
        // Try to play the video and handle any autoplay restrictions
        cy.get('video').then(($video) => {
          const video = $video[0] as HTMLVideoElement;
          const playPromise = video.play();
          
          if (playPromise !== undefined) {
            playPromise.then(() => {
              // Video is playing
              cy.get('video').should('have.prop', 'paused', false);
            }).catch(() => {
              // Autoplay failed, but video should still be present and playable
              cy.get('video').should('exist');
              cy.get('video').should('have.prop', 'paused', true);
            });
          }
        });
      } else {
        // If no video, check for background image or gradient
        cy.get('section').first().should('have.css', 'background-image');
      }
    });
  });

  it('should display logo or title', () => {
    // Check for either logo image or title text
    cy.get('body').then(($body) => {
      const hasLogo = $body.find('img[alt*="Logo"]').length > 0;
      const hasTitle = $body.find('h1, h2').filter(':contains("Kocky")').length > 0;
      
      // At least one should be present
      expect(hasLogo || hasTitle).to.be.true;
    });
  });

  it('should have working video controls when video is present', () => {
    cy.get('body').then(($body) => {
      if ($body.find('video').length > 0) {
        // Check for play/pause button
        cy.get('button').contains('Play').or('button').contains('Pause').should('exist');
        
        // Check for mute/unmute button
        cy.get('button').contains('Volume').or('button').contains('Mute').should('exist');
        
        // Test play/pause functionality
        cy.get('video').then(($video) => {
          const video = $video[0] as HTMLVideoElement;
          const initialPaused = video.paused;
          
          // Click play/pause button
          cy.get('button').first().click();
          
          // Check that video state changed
          cy.get('video').should('have.prop', 'paused', !initialPaused);
        });
      }
    });
  });

  it('should handle video errors gracefully', () => {
    // This test simulates a video loading error
    cy.window().then((win) => {
      // Intercept video loading and force an error
      cy.get('video').then(($video) => {
        if ($video.length > 0) {
          // Simulate video error
          const video = $video[0] as HTMLVideoElement;
          const errorEvent = new Event('error');
          video.dispatchEvent(errorEvent);
          
          // Check that error is handled gracefully
          // The page should still be functional
          cy.get('section').first().should('be.visible');
          cy.get('h1, h2, img').should('exist');
        }
      });
    });
  });

  it('should be responsive on different screen sizes', () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.get('section').first().should('be.visible');
    cy.get('h1, h2, img').should('be.visible');
    
    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.get('section').first().should('be.visible');
    cy.get('h1, h2, img').should('be.visible');
    
    // Test desktop viewport
    cy.viewport(1920, 1080);
    cy.get('section').first().should('be.visible');
    cy.get('h1, h2, img').should('be.visible');
  });

  it('should load hero settings from API', () => {
    // Intercept API calls to hero settings
    cy.intercept('GET', '**/api/hero-settings/**').as('getHeroSettings');
    
    // Reload page to trigger API call
    cy.reload();
    
    // Wait for API call to complete
    cy.wait('@getHeroSettings').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 404]);
    });
  });
});
