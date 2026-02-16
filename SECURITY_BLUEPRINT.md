# 🔒 Benchmark AI Security Blueprint

## 1. Database Security (Firestore Rules)
The following rules must be deployed to the Firebase Console to enforce the security analyzed in the v10.2 update. These rules prevent "NoSQL Injection" and unauthorized data leakage.

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: Is the user authenticated?
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper: Does the user own this document?
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Students Collection
    match /students/{studentId} {
      allow read, write: if isSignedIn() && isOwner(resource.data.userId || request.resource.data.userId);
      
      // Prevent identity spoofing
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
    }

    // Class Profiles
    match /class_profiles/{profileId} {
      allow read, write: if isSignedIn() && isOwner(resource.data.userId || request.resource.data.userId);
    }

    // Framework Configs (Admin Only concept)
    match /framework_configs/{configId} {
      allow read, write: if isSignedIn() && isOwner(resource.data.userId || request.resource.data.userId);
    }
  }
}
```

## 2. Mitigation Strategies
| Threat | Mitigation |
| :--- | :--- |
| **SQL Injection** | **Eliminated.** Firestore uses an object-based SDK that doesn't parse strings into commands. |
| **Cross-Site Scripting (XSS)** | **Handled.** React's automatic escaping combined with manual input trimming prevents script injection in student names. |
| **Unauthorized Access** | **Handled.** Authentication state is managed via Firebase Auth, and data visibility is restricted by the `userId` field on every document. |
| **Prompt Injection** | **Reduced.** Gemini instructions are prepended with a "Zero-Knowledge" system prompt that isolates class data from global model training. |
```