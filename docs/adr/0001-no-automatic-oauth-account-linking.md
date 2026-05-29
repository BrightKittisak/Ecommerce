# No Automatic OAuth Account Linking

Lush Commerce does not automatically link an OAuth identity to an existing **User Account** only because the email address matches. This keeps the default Auth.js `OAuthAccountNotLinked` behavior for Google sign-in, because automatic email-based linking is a security-sensitive trade-off and email collision or provider trust assumptions should not silently take ownership of an existing **User Account**.
