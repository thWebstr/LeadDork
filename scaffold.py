import os

files = [
    "client/public/favicon.ico",
    "client/src/assets/.gitkeep",
    "client/src/components/SearchBar/SearchBar.jsx",
    "client/src/components/SearchBar/SearchBar.css",
    "client/src/components/QueryCard/QueryCard.jsx",
    "client/src/components/QueryCard/QueryCard.css",
    "client/src/components/LeadTable/LeadTable.jsx",
    "client/src/components/LeadTable/LeadTable.css",
    "client/src/components/SearchHistory/SearchHistory.jsx",
    "client/src/components/SearchHistory/SearchHistory.css",
    "client/src/components/TagBadge/TagBadge.jsx",
    "client/src/components/TagBadge/TagBadge.css",
    "client/src/components/Sidebar/Sidebar.jsx",
    "client/src/components/Sidebar/Sidebar.css",
    "client/src/pages/Dashboard/Dashboard.jsx",
    "client/src/pages/Dashboard/Dashboard.css",
    "client/src/pages/Leads/Leads.jsx",
    "client/src/pages/Leads/Leads.css",
    "client/src/pages/History/History.jsx",
    "client/src/pages/History/History.css",
    "client/src/pages/Settings/Settings.jsx",
    "client/src/pages/Settings/Settings.css",
    "client/src/services/api.js",
    "client/src/services/anthropic.js",
    "client/src/hooks/useLeads.js",
    "client/src/hooks/useSearchHistory.js",
    "client/src/utils/exportCSV.js",
    "client/src/utils/buildGoogleUrl.js",
    "client/src/App.jsx",
    "client/src/App.css",
    "client/src/index.css",
    "client/src/main.jsx",
    "client/index.html",
    "client/vite.config.js",
    "server/config/db.js",
    "server/controllers/leadsController.js",
    "server/controllers/searchController.js",
    "server/controllers/historyController.js",
    "server/routes/leads.js",
    "server/routes/search.js",
    "server/routes/history.js",
    "server/middleware/errorHandler.js",
    "server/middleware/validateRequest.js",
    "server/db/schema.sql",
    "server/index.js",
    ".gitignore"
]

base_dir = r"c:\Users\USER\Desktop\@ay_thWebstr\LeadDork"

for f in files:
    path = os.path.join(base_dir, f.replace("/", os.sep))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not os.path.exists(path):
        with open(path, 'w') as fh:
            fh.write("")
