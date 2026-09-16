const fs = require('fs');
let content = fs.readFileSync('client/hooks/useAuth.js', 'utf8');

// Replace the early return logic
const oldLogic = `        let resolvedUser = user;
        if (!resolvedUser) {
          // No user data found \u2014 don't assume any role, force re-login
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isAuthenticated: true, user: resolvedUser, token, isLoading: false });

        if (typeof token === 'string' && token.startsWith('mock_')) {
          return;
        }`;

const newLogic = `        let resolvedUser = user;
        
        // If we have a user in state, set it immediately for fast UI response
        if (resolvedUser) {
          set({ isAuthenticated: true, user: resolvedUser, token, isLoading: false });
        } else {
          // We have a token but no user, set loading state to true while we fetch
          set({ isAuthenticated: false, token, isLoading: true });
        }

        if (typeof token === 'string' && token.startsWith('mock_')) {
          return;
        }`;

content = content.replace(oldLogic, newLogic);

// Also need to handle when /auth/me fails if we didn't have a resolvedUser initially
const oldCatch = `        } catch (error) {
           set({ isAuthenticated: true, isLoading: false });
        }`;
const newCatch = `        } catch (error) {
           // If /auth/me fails and we don't have a user, token is likely invalid
           if (!resolvedUser) {
             set({ user: null, token: null, isAuthenticated: false, isLoading: false });
           } else {
             set({ isAuthenticated: true, isLoading: false });
           }
        }`;

content = content.replace(oldCatch, newCatch);

fs.writeFileSync('client/hooks/useAuth.js', content);
