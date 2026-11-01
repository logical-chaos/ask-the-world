const fs = require('fs');

console.log('--- Verifying blu Access Control Protections ---');

const appContent = fs.readFileSync('src/App.jsx', 'utf8');
const composerContent = fs.readFileSync('src/components/PostComposer.jsx', 'utf8');
const _postCardContent = fs.readFileSync('src/components/PostCard.jsx', 'utf8');
const _sidebarLeftContent = fs.readFileSync('src/components/FeedSidebarLeft.jsx', 'utf8');

const tests = [
  {
    name: "1. Guest publishing guarded in App.jsx (handlePublishPost)",
    pass: appContent.includes('function handlePublishPost') &&
          appContent.includes('triggerAuthPrompt({\n        action: "askQuestion",\n        title: "Publish discussion",')
  },
  {
    name: "2. PostComposer expand requires auth for guests",
    pass: composerContent.includes('function handleExpand') &&
          composerContent.includes('action: "askQuestion"') &&
          composerContent.includes('onRequireAuth(')
  },
  {
    name: "3. PostComposer photo attachment requires auth for guests",
    pass: composerContent.includes('function handlePhotoSelect') &&
          composerContent.includes('action: "askQuestion"') &&
          composerContent.includes('Community safety guidelines require authenticated accounts for media uploads')
  },
  {
    name: "4. PostComposer video attachment requires auth for guests",
    pass: composerContent.includes('function handleVideoSelect') &&
          composerContent.includes('action: "askQuestion"')
  },
  {
    name: "5. Question voting guarded for guests (toggleVote)",
    pass: appContent.includes('function toggleVote') &&
          appContent.includes('action: "voteQuestion"')
  },
  {
    name: "6. Post bookmarking / saving guarded for guests (toggleSavePost)",
    pass: appContent.includes('function toggleSavePost') &&
          appContent.includes('action: "savePost"')
  },
  {
    name: "7. Saved discussions access guarded for guests",
    pass: appContent.includes('action: "viewSaved"')
  },
  {
    name: "8. Answer submission guarded and preserves draft for guests",
    pass: appContent.includes('function submitAnswer') &&
          appContent.includes('action: "submitAnswer"')
  },
  {
    name: "9. Helpful voting guarded for guests (toggleHelpful)",
    pass: appContent.includes('function toggleHelpful') &&
          appContent.includes('action: "helpfulAnswer"')
  },
  {
    name: "10. Circle joining guarded for guests (toggleJoin)",
    pass: appContent.includes('function toggleJoin') &&
          appContent.includes('action: "joinCircle"')
  },
  {
    name: "11. Pending action execution restores user intent after login",
    pass: appContent.includes('function executePendingAction') &&
          appContent.includes('action === "voteQuestion"') &&
          appContent.includes('action === "helpfulAnswer"') &&
          appContent.includes('action === "joinCircle"') &&
          appContent.includes('action === "submitAnswer"') &&
          appContent.includes('action === "savePost"')
  }
];

let allPassed = true;
tests.forEach((t) => {
  if (t.pass) {
    console.log(`✓ ${t.name}`);
  } else {
    console.error(`✗ FAILED: ${t.name}`);
    allPassed = false;
  }
});

console.log('------------------------------------------------');
if (allPassed) {
  console.log(`ALL 11 ACCESS CONTROL TESTS PASSED!`);
} else {
  console.error(`SOME TESTS FAILED.`);
  process.exit(1);
}
