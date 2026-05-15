(function enforcePageAuth() {
  var publicPages = ["/", "/login.html"];
  // Only block non-admins from explicit admin-only pages.
  var adminOnlyPages = ["/settings.html", "/add_user.html"];
  var viewerBlockedPatterns = [
    /^\/add_/i,
    /\/add_edit/i,
    /\/update/i,
    /\/edit/i,
    /\/upload/i,
    /\/pmc_slice_editor/i,
  ];
  var currentPath = window.location.pathname;
  var now = Math.floor(Date.now() / 1000);

  if (publicPages.indexOf(currentPath) !== -1) {
    return;
  }

  var token = localStorage.getItem("token");
  if (!token) {
    window.location.replace("/");
    return;
  }

  var parts = token.split(".");
  if (parts.length !== 3) {
    localStorage.clear();
    window.location.replace("/");
    return;
  }

  try {
    var payload = JSON.parse(atob(parts[1]));
    if (!payload) {
      localStorage.clear();
      window.location.replace("/");
      return;
    }

    if (payload.role !== "admin" && adminOnlyPages.indexOf(currentPath) !== -1) {
      window.location.replace("/home.html");
      return;
    }

    if (payload.role === "viewer") {
      var blocked = viewerBlockedPatterns.some(function (pattern) {
        return pattern.test(currentPath);
      });
      if (blocked) {
        window.location.replace("/home.html");
        return;
      }
    }

    if (payload.exp && payload.exp <= now) {
      localStorage.clear();
      window.location.replace("/");
    }
  } catch (e) {
    localStorage.clear();
    window.location.replace("/");
  }
})();