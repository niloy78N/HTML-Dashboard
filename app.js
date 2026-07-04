// App Architecture for SimLess Dashboard

const App = {
    smsChart: null,
    htmlElement: document.documentElement,
    chartCtx: document.getElementById('smsChart'),

    // Simulated Branding Database
    defaultBranding: {
        companyName: "SimLess",
        logoUrl: "", // Use CSS/SVG fallback if empty
        favicon: "",
        primaryColor: "#16a34a" // Default Green
    },

    // Navigation Structure with Permissions
    navMenu: [
        { title: "Dashboard", icon: "layout-dashboard", permission: "dashboard.view", url: "view-dashboard", submenus: [] },
        { title: "IPRN SMS Module", icon: "message-square", permission: "iprn.view", url: "#", 
          submenus: [
              { title: "Number Request System", url: "view-sms-ranges" },
              { title: "User Numbers", url: "view-my-numbers" },
              { title: "Manual Price List", url: "view-sms-ratecard" },
              { title: "Available Countries", url: "view-bulk-allocations" }
          ] 
        },
        { title: "SMS Test Panel", icon: "flask-conical", permission: "test.view", url: "view-sms-test", submenus: [] },
        { title: "Client Management", icon: "users", permission: "clients.view", url: "view-clients", submenus: [] },
        { title: "Full SMS Logs", icon: "bar-chart-2", permission: "stats.view", url: "#", 
          submenus: [
              { title: "Detailed SMS Reports", url: "view-sms-cdr" },
              { title: "Client SMS Stats", url: "view-client-stats" }
          ] 
        },
        { title: "Balance & Profit", icon: "file-text", permission: "billing.view", url: "view-credit-notes", submenus: [] },
        { title: "App Management", icon: "grid", permission: "super.admin", url: "view-app-management", submenus: [] },
        { title: "Settings", icon: "settings", permission: "admin.settings", url: "#", 
          submenus: [
              { title: "System Settings", url: "settings.html", isExternal: true },
              { title: "Agent Management", url: "view-agent-management", permission: "agents.manage" }
          ] 
        } 
    ],

    init() {
        this.loadBranding();
        this.initTheme();
        this.initClock();
        this.initMobileMenu();
        this.initProfileMenu();
        
        const isSettings = window.location.pathname.includes('settings.html');

        if(!isSettings) {
            if (this.chartCtx) this.initChart();
            this.renderEmptyState();
            this.initAuth(); // Handle Login logic
        } else {
            // We are on settings page
            this.fetchData(); // Skip login for settings page in this demo
        }
    },

    loadBranding() {
        // Fetch from LocalStorage (Simulating DB)
        const savedBranding = JSON.parse(localStorage.getItem('simless_branding')) || this.defaultBranding;
        
        // Apply CSS Variables
        document.documentElement.style.setProperty('--color-primary', savedBranding.primaryColor);
        
        // Apply Favicon
        if (savedBranding.favicon) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = savedBranding.favicon;
        }

        // Apply Logo & Company Name
        const logoImg = document.getElementById('brandLogoImg');
        const logoSvg = document.getElementById('brandLogoSvg');
        const companyText = document.getElementById('companyNameDisplay');
        const loginLogoImg = document.getElementById('loginLogoImg');
        const loginLogoSvg = document.getElementById('loginLogoSvg');
        const loginCompanyName = document.getElementById('loginCompanyName');
        const headerLogoImg = document.getElementById('headerLogoImg');

        if (companyText) companyText.innerText = savedBranding.companyName;
        if (loginCompanyName) loginCompanyName.innerText = savedBranding.companyName;

        const applyTo = savedBranding.applyTo || { login: true, sidebar: true, header: true, mobileMenu: true };

        if (savedBranding.logoUrl) {
            if(logoImg && logoSvg) {
                if (applyTo.sidebar || applyTo.mobileMenu) {
                    logoImg.src = savedBranding.logoUrl;
                    logoImg.classList.remove('hidden');
                    logoSvg.classList.add('hidden');
                } else {
                    logoImg.classList.add('hidden');
                    logoSvg.classList.remove('hidden');
                }
            }
            if(loginLogoImg && loginLogoSvg) {
                if (applyTo.login) {
                    loginLogoImg.src = savedBranding.logoUrl;
                    loginLogoImg.classList.remove('hidden');
                    loginLogoSvg.classList.add('hidden');
                } else {
                    loginLogoImg.classList.add('hidden');
                    loginLogoSvg.classList.remove('hidden');
                }
            }
            if (headerLogoImg) {
                if (applyTo.header) {
                    headerLogoImg.src = savedBranding.logoUrl;
                    headerLogoImg.classList.remove('hidden');
                } else {
                    headerLogoImg.classList.add('hidden');
                }
            }
        } else {
            if(logoImg && logoSvg) {
                logoImg.classList.add('hidden');
                logoSvg.classList.remove('hidden');
            }
            if(loginLogoImg && loginLogoSvg) {
                loginLogoImg.classList.add('hidden');
                loginLogoSvg.classList.remove('hidden');
            }
            if(headerLogoImg) {
                headerLogoImg.classList.add('hidden');
            }
        }
    },

    renderNavigation(userPermissions) {
        const navContainer = document.getElementById('sidebarNav');
        if (!navContainer) return;

        navContainer.innerHTML = ''; // Clear container

        this.navMenu.forEach((item, index) => {
            // Filter by permission
            if (!userPermissions.includes(item.permission)) return;

            // Filter submenus by permission
            let visibleSubmenus = [];
            if (item.submenus) {
                visibleSubmenus = item.submenus.filter(sub => !sub.permission || userPermissions.includes(sub.permission));
            }

            const hasSubmenu = visibleSubmenus.length > 0;
            const submenuId = `submenu-${index}`;
            
            // Current Page Check (Simple simulation)
            const isActive = window.location.pathname.includes(item.url) && item.url.includes('.html');
            const isExternal = item.isExternal || item.url.includes('.html');
            const href = isExternal ? item.url : '#';
            const onclick = (!hasSubmenu && !isExternal && item.url !== '#') ? `App.switchView('${item.url}')` : (hasSubmenu ? `App.toggleSubmenu('${submenuId}', this)` : '');

            const navItem = document.createElement('div');
            navItem.className = 'mb-1';
            
            let html = `
                <a href="${href}" class="nav-item ${isActive ? 'active' : 'text-[var(--text-secondary)]'} flex items-center justify-between px-4 py-3 font-medium cursor-pointer" ${onclick ? `onclick="${onclick}"` : ''}>
                    <div class="flex items-center gap-3">
                        <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                        <span>${item.title}</span>
                    </div>
                    ${hasSubmenu ? `<i data-lucide="chevron-down" class="w-4 h-4 transition-transform duration-300 transform" id="icon-${submenuId}"></i>` : ''}
                </a>
            `;

            if (hasSubmenu) {
                html += `<div id="${submenuId}" class="submenu flex flex-col pl-11 pr-4 gap-1 mt-1">`;
                visibleSubmenus.forEach(sub => {
                    const isSubExternal = sub.isExternal || sub.url.includes('.html');
                    const subHref = isSubExternal ? sub.url : '#';
                    const subOnclick = (!isSubExternal && sub.url !== '#') ? `onclick="App.switchView('${sub.url}')"` : '';
                    html += `<a href="${subHref}" ${subOnclick} class="submenu-item text-sm text-[var(--text-secondary)] py-2 px-3 block">${sub.title}</a>`;
                });
                html += `</div>`;
            }

            navItem.innerHTML = html;
            navContainer.appendChild(navItem);
        });

        lucide.createIcons();
    },

    toggleSubmenu(submenuId, element) {
        const submenu = document.getElementById(submenuId);
        const icon = document.getElementById(`icon-${submenuId}`);
        if (!submenu) return;
        
        const isOpen = submenu.classList.contains('open');
        
        if (isOpen) {
            submenu.classList.remove('open');
            icon.classList.remove('-rotate-180');
            element.classList.remove('bg-[var(--color-primary-light)]', 'text-[var(--color-primary)]');
        } else {
            submenu.classList.add('open');
            icon.classList.add('-rotate-180');
            element.classList.add('bg-[var(--color-primary-light)]', 'text-[var(--color-primary)]');
        }
    },

    switchView(viewId) {
        const role = localStorage.getItem('simless_role');
        if (role !== 'owner' && (viewId === 'view-agent-management' || viewId === 'view-app-management' || viewId === 'view-dashboard')) {
            console.warn("Unauthorized view access.");
            return;
        }

        if(window.innerWidth < 1024) {
            // Close mobile sidebar on navigation
            const sidebar = document.getElementById('sidebar');
            const mobileOverlay = document.getElementById('mobileOverlay');
            if(sidebar && mobileOverlay) {
                sidebar.classList.add('-translate-x-full');
                sidebar.classList.remove('mobile-sidebar-active');
                mobileOverlay.classList.add('opacity-0');
                setTimeout(() => mobileOverlay.classList.add('hidden'), 300);
            }
        }

        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => {
            el.classList.remove('active');
        });
        
        // Show target view
        const target = document.getElementById(viewId);
        if(target) target.classList.add('active');

        // Update nav active state visually
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active', 'text-[var(--color-primary)]'));
        document.querySelectorAll('.submenu-item').forEach(el => el.classList.remove('text-[var(--color-primary)]', 'font-semibold'));
        
        const activeLink = document.querySelector(`a[onclick*="${viewId}"]`);
        if(activeLink) {
            if(activeLink.classList.contains('nav-item')) {
                activeLink.classList.add('active');
            } else {
                activeLink.classList.add('text-[var(--color-primary)]', 'font-semibold');
            }
        }
    },

    initTheme() {
        const themeToggleBtn = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        const updateThemeIcon = (isDark) => {
            if(themeIcon) themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
            lucide.createIcons();
        };

        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
            this.htmlElement.classList.add('dark');
            updateThemeIcon(true);
        } else {
            updateThemeIcon(false);
        }

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                this.htmlElement.classList.toggle('dark');
                const isDark = this.htmlElement.classList.contains('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                updateThemeIcon(isDark);
                this.updateChartTheme();
            });
        }
    },

    initClock() {
        const timeElement = document.getElementById('currentTime');
        const dateElement = document.getElementById('currentDate');

        const updateClock = () => {
            const now = new Date();
            if (timeElement) timeElement.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            if (dateElement) dateElement.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
        };
        setInterval(updateClock, 1000);
        updateClock();
    },

    initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('sidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

        const toggleSidebar = () => {
            if(sidebar.classList.contains('-translate-x-full')) {
                sidebar.classList.remove('-translate-x-full');
                sidebar.classList.add('mobile-sidebar-active'); 
                mobileOverlay.classList.remove('hidden');
                setTimeout(() => mobileOverlay.classList.remove('opacity-0'), 10);
            } else {
                sidebar.classList.add('-translate-x-full');
                sidebar.classList.remove('mobile-sidebar-active');
                mobileOverlay.classList.add('opacity-0');
                setTimeout(() => mobileOverlay.classList.add('hidden'), 300);
            }
        };

        if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleSidebar);
        if(mobileOverlay) mobileOverlay.addEventListener('click', toggleSidebar);
        if(sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', toggleSidebar);
    },

    renderEmptyState() {
        const newsBody = document.getElementById('newsTableBody');
        if (newsBody) {
            newsBody.innerHTML = `<tr><td colspan="3" class="p-12 text-center"><div class="flex flex-col items-center justify-center text-[var(--text-secondary)]"><div class="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700"><i data-lucide="bell-off" class="w-8 h-8 text-slate-400"></i></div><p class="font-medium text-lg text-[var(--text-primary)]">No notifications available.</p></div></td></tr>`;
        }
    },

    initProfileMenu() {
        const profileMenuBtn = document.getElementById('profileMenuBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        if(profileMenuBtn && profileDropdown) {
            profileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('show');
            });
            document.addEventListener('click', (e) => {
                if(!profileDropdown.contains(e.target)) {
                    profileDropdown.classList.remove('show');
                }
            });
        }
    },

    initAuth() {
        const overlay = document.getElementById('loginOverlay');
        const loginForm = document.getElementById('loginForm');
        
        // Math Captcha Setup
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const answer = num1 + num2;
        const captchaEl = document.getElementById('captchaQuestion');
        if(captchaEl) captchaEl.innerText = `${num1} + ${num2} =`;

        // Check Local Storage Session
        if (localStorage.getItem('simless_auth') === 'true') {
            const role = localStorage.getItem('simless_role');
            if (role === 'agent' && !window.location.pathname.includes('agent-dashboard.html')) {
                window.location.href = 'agent-dashboard.html';
                return;
            } else if (role === 'owner' && window.location.pathname.includes('agent-dashboard.html')) {
                window.location.href = 'index.html';
                return;
            }
            if(overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.classList.add('hidden'), 500);
            }
            this.fetchData();
        } else {
            if (window.location.pathname.includes('agent-dashboard.html')) {
                window.location.href = 'index.html';
                return;
            }
        }

        if(loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const u = document.getElementById('loginUsername').value;
                const p = document.getElementById('loginPassword').value;
                const c = parseInt(document.getElementById('loginCaptcha').value);
                const err = document.getElementById('loginError');
                
                err.classList.add('hidden');
                
                if (c !== answer) {
                    err.innerText = "Incorrect Captcha!";
                    err.classList.remove('hidden');
                    return;
                }

                let authSuccess = false;
                let role = '';
                
                const ua = navigator.userAgent;
                let browser = "Unknown Browser";
                if(ua.includes("Chrome")) browser = "Chrome";
                else if(ua.includes("Firefox")) browser = "Firefox";
                else if(ua.includes("Safari")) browser = "Safari";
                else if(ua.includes("Edge")) browser = "Edge";
                
                const loginData = {
                    time: new Date().toLocaleString(),
                    ip: '127.0.0.1',
                    device: navigator.platform,
                    browser: browser
                };

                if (u === 'nrnfxniloy') {
                    authSuccess = true;
                    role = 'owner';
                    const history = JSON.parse(localStorage.getItem('simless_owner_history')) || [];
                    history.unshift(loginData);
                    localStorage.setItem('simless_owner_history', JSON.stringify(history));
                } else {
                    const agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
                    const agent = agents.find(a => a.username === u && a.password === p && a.status === 'Active');
                    if (agent) {
                        authSuccess = true;
                        role = 'agent';
                        
                        agent.loginHistory = agent.loginHistory || [];
                        agent.loginHistory.unshift(loginData);
                        localStorage.setItem('simless_agents', JSON.stringify(agents));
                    }
                }

                if (authSuccess) {
                    localStorage.setItem('simless_auth', 'true');
                    localStorage.setItem('simless_role', role);
                    localStorage.setItem('simless_user', u);
                    if (role === 'agent') {
                        window.location.href = 'agent-dashboard.html';
                        return;
                    }
                    overlay.style.opacity = '0';
                    setTimeout(() => overlay.classList.add('hidden'), 500);
                    this.fetchData();
                } else {
                    err.innerText = "Invalid Username, Password, or Account Disabled";
                    err.classList.remove('hidden');
                }
            });
        }
    },

    logout() {
        localStorage.removeItem('simless_auth');
        window.location.reload();
    },

    renderMyActivity() {
        const role = localStorage.getItem('simless_role');
        const username = localStorage.getItem('simless_user');
        
        let history = [];
        if (role === 'owner') {
            history = JSON.parse(localStorage.getItem('simless_owner_history')) || [];
        } else {
            const agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
            const agent = agents.find(a => a.username === username);
            if (agent) history = agent.loginHistory || [];
        }

        const tbody = document.getElementById('myActivityTableBody');
        const totalLogins = document.getElementById('myTotalLogins');
        
        if (totalLogins) totalLogins.innerText = history.length;
        
        if (!tbody) return;

        if (history.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-[var(--text-secondary)] font-medium">No activity found.</td></tr>`;
            return;
        }

        tbody.innerHTML = history.map(h => `
            <tr class="hover:bg-[var(--color-primary-light)] transition-colors">
                <td class="p-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">${h.time}</td>
                <td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">${h.ip || 'Unknown'}</td>
                <td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">${h.device || 'Unknown'}</td>
                <td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">${h.browser || 'Unknown'}</td>
            </tr>
        `).join('');
    },

    fetchData() {
        const role = localStorage.getItem('simless_role') || 'owner';
        const username = localStorage.getItem('simless_user') || 'nrnfxniloy';
        
        let currentUser = {};
        
        if (role === 'owner') {
            currentUser = {
                username: username,
                fullName: 'Owner',
                email: 'admin@simless.com',
                role: 'Super Administrator',
                permissions: ['dashboard.view', 'iprn.view', 'test.view', 'clients.view', 'stats.view', 'billing.view', 'account.view', 'news.view', 'api.view', 'admin.settings', 'super.admin', 'agents.manage']
            };
        } else {
            currentUser = {
                username: username,
                fullName: 'Agent',
                email: 'agent@simless.com',
                role: 'Agent',
                permissions: ['dashboard.view', 'iprn.view', 'test.view', 'clients.view', 'stats.view', 'billing.view', 'account.view', 'news.view']
            };
        }

        const apiResponse = {
            user: currentUser,
            stats: {
                todaySMS: 0,
                yesterdaySMS: 0,
                thisWeekSMS: 0,
                thisMonthSMS: 0,
                newAccounts: 0,
                newNumbers: 0
            },
            chart: []
        };

        this.renderNavigation(apiResponse.user.permissions);
        this.updateUserUI(apiResponse.user);
        this.updateStatsUI(apiResponse.stats);
        if(this.chartCtx) {
            this.updateChartUI(apiResponse.chart);
        }
        
        this.fetchRealBalance();
        this.populateViews();
        
        if (role === 'owner') {
            this.switchView('view-dashboard');
            this.renderAgentManagement();
        } else {
            this.switchView('view-dashboard');
        }
    },

    populateViews() {
        // Activity
        const activityBody = document.getElementById('activityTableBody');
        if(activityBody) {
            activityBody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-[var(--text-secondary)] font-medium">No activity data found.</td></tr>`;
        }

        // SMS Test Panel is handled by renderSmsTestPanel

        // SMS CDR is handled by renderSmsCdr

        // Clients
        const clientsBody = document.getElementById('myClientsTableBody');
        if(clientsBody) {
            clientsBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-[var(--text-secondary)] font-medium">No clients created yet.</td></tr>`;
        }

        // App Mgmt
        this.renderAppManagement();

        // Credit Notes
        const creditBody = document.getElementById('creditNotesTableBody');
        if(creditBody) {
            creditBody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-[var(--text-secondary)] font-medium">No credit activity available.</td></tr>`;
        }

        // Numbers (SMS Ranges)
        const numbersGrid = document.getElementById('numbersGrid');
        if(numbersGrid) {
            const apiEnabled = localStorage.getItem('simless_api_enabled') === 'true';
            const apiKey = localStorage.getItem('simless_api_key');
            if (apiEnabled && apiKey) {
                this.fetchNumbers(numbersGrid);
            } else {
                numbersGrid.innerHTML = `
                    <div class="col-span-1 md:col-span-2 lg:col-span-3 glass-card p-12 flex flex-col items-center justify-center text-center">
                        <div class="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                            <i data-lucide="settings" class="w-8 h-8 text-[var(--text-secondary)]"></i>
                        </div>
                        <p class="font-medium text-lg text-[var(--text-primary)]">No countries available. Please configure the Number Provider API in Settings.</p>
                    </div>
                `;
            }
        }

        // My Assigned Numbers
        const myNumbersBody = document.getElementById('myNumbersTableBody');
        if(myNumbersBody) {
            myNumbersBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-[var(--text-secondary)] font-medium">No numbers assigned yet.</td></tr>`;
        }

        // SMS RateCard
        this.renderSmsRateCard();
        
        // Bulk Number Allocations
        this.renderBulkAllocations();
        
        // Reset Client Statistics to 0
        const statTotalClientSms = document.getElementById('statTotalClientSms');
        if(statTotalClientSms) statTotalClientSms.innerText = "0";

        lucide.createIcons();
    },


    async fetchRealBalance() {
        const apiKey = localStorage.getItem('simless_api_key');
        const apiEnabled = localStorage.getItem('simless_api_enabled') === 'true';
        if (!apiEnabled || !apiKey) return;
        
        try {
            const response = await fetch('https://5sim.net/v1/user/profile', {
                headers: {
                    'Authorization': 'Bearer ' + apiKey,
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                const balanceEl = document.getElementById('agentStatBalance');
                if (balanceEl) {
                    balanceEl.innerText = '$' + parseFloat(data.balance).toFixed(2);
                }
                const role = localStorage.getItem('simless_role');
                if (role === 'agent') {
                    const username = localStorage.getItem('simless_user');
                    const agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
                    const agent = agents.find(a => a.username === username);
                    if(agent) {
                        agent.balance = data.balance;
                        localStorage.setItem('simless_agents', JSON.stringify(agents));
                    }
                }
            } else {
                console.error('API Error: Invalid Key or unauthorized');
                alert('API Error: Failed to fetch balance. Check API Key.');
            }
        } catch(e) {
            console.error('Network Error fetching balance', e);
        }
    },
    fetchNumbers(grid) {
        try {
            const data = JSON.parse(localStorage.getItem('simless_api_numbers') || '[]');

            if (!data || data.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-1 md:col-span-2 lg:col-span-3 glass-card p-12 flex flex-col items-center justify-center text-center">
                        <p class="font-medium text-lg text-[var(--text-primary)]">No numbers available.</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = data.map(item => `
                <div class="glass-card p-6 flex flex-col items-center text-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div class="text-5xl mb-2">${item.flag}</div>
                    <h3 class="text-xl font-display font-bold text-[var(--text-primary)]">${item.country}</h3>
                    <div class="w-full flex justify-between items-center px-4 py-2 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]">
                        <span class="text-sm text-[var(--text-secondary)] font-medium">Available</span>
                        <span class="font-bold text-[var(--text-primary)]">${item.available}</span>
                    </div>
                    <div class="w-full flex justify-between items-center px-4 py-2 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]">
                        <span class="text-sm text-[var(--text-secondary)] font-medium">Price</span>
                        <span class="font-bold text-[var(--color-primary)]">$${Number(item.price).toFixed(2)}</span>
                    </div>
                    <div class="flex items-center gap-2 w-full mt-2">
                        <button onclick="App.requestNumbers()" class="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            <i data-lucide="shopping-cart" class="w-4 h-4 text-white"></i>
                            Request
                        </button>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        } catch (error) {
            grid.innerHTML = `<div class="col-span-full text-center text-red-500">Error fetching numbers.</div>`;
        }
    },

    async requestNumbers(country, operator, product, price) {
        const apiKey = localStorage.getItem('simless_api_key');
        if (!apiKey) {
            alert("No API key configured. Please set it in Settings.");
            return;
        }
        
        try {
            alert(`Requesting ${product} number for ${country}...`);
            const response = await fetch(`https://5sim.net/v1/user/buy/activation/${country}/${operator}/${product}`, {
                headers: {
                    'Authorization': 'Bearer ' + apiKey,
                    'Accept': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert(`Successfully purchased number: ${data.phone}`);
                
                // Save to My Numbers
                let myNumbers = JSON.parse(localStorage.getItem('simless_my_numbers')) || [];
                myNumbers.unshift({
                    number: data.phone,
                    country: country,
                    app: product,
                    status: 'Active',
                    orderId: data.id
                });
                localStorage.setItem('simless_my_numbers', JSON.stringify(myNumbers));
                
                // Update balance
                this.fetchRealBalance();
                
                // Update dashboard KPIs and My Numbers view
                const kpiNewNumbers = document.getElementById('kpiNewNumbers');
                if(kpiNewNumbers) {
                    let current = parseInt(kpiNewNumbers.innerText.replace(/,/g, ''));
                    this.setStat('kpiNewNumbers', current + 1);
                }
                const activeNumbers = document.getElementById('agentStatActiveNumbers');
                if(activeNumbers) {
                    let current = parseInt(activeNumbers.innerText);
                    activeNumbers.innerText = current + 1;
                }
                this.renderMyNumbers();
                
            } else {
                alert(`API Error: ${data || 'Failed to buy number. Check balance or stock.'}`);
            }
        } catch(e) {
            console.error(e);
            alert("Network Error requesting number.");
        }
    },

    renderBulkAllocations() {
        const grid = document.getElementById('bulkAllocationsGrid');
        if(!grid) return;

        let countries = JSON.parse(localStorage.getItem('simless_bulk_countries')) || [];

        if(countries.length === 0) {
            grid.innerHTML = `
                <div class="col-span-1 md:col-span-2 lg:col-span-3 glass-card p-12 flex flex-col items-center justify-center text-center">
                    <div class="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                        <i data-lucide="layers" class="w-8 h-8 text-[var(--text-secondary)]"></i>
                    </div>
                    <p class="font-medium text-lg text-[var(--text-primary)]">No countries are currently available.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = countries.map(country => `
            <div class="glass-card p-6 flex flex-col items-center text-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                <div class="text-5xl mb-2">${country.flag}</div>
                <h3 class="text-xl font-display font-bold text-[var(--text-primary)]">${country.name}</h3>
                <div class="w-full flex justify-between items-center px-4 py-2 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]">
                    <span class="text-sm text-[var(--text-secondary)] font-medium">Available</span>
                    <span class="font-bold text-[var(--text-primary)]">${country.availableNumbers}</span>
                </div>
                <div class="w-full flex justify-between items-center px-4 py-2 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]">
                    <span class="text-sm text-[var(--text-secondary)] font-medium">Price</span>
                    <span class="font-bold text-[var(--color-primary)]">$${Number(country.price).toFixed(2)}</span>
                </div>
                <div class="flex items-center gap-2 w-full mt-2">
                    <input type="number" min="1" max="10" value="1" class="w-20 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-center font-bold" id="bulk-qty-${country.id || country.name.replace(/\\s+/g, '-').toLowerCase()}">
                    <button onclick="App.requestBulkNumbers('${country.id || country.name.replace(/\\s+/g, '-').toLowerCase()}')" class="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                        <i data-lucide="shopping-cart" class="w-4 h-4 text-white"></i>
                        Request
                    </button>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    },

    requestBulkNumbers(countryId) {
        const qtyInput = document.getElementById(`bulk-qty-${countryId}`);
        if(!qtyInput) return;
        const qty = parseInt(qtyInput.value);
        if(isNaN(qty) || qty < 1) {
            alert('Please request at least 1 number.');
            return;
        }
        if(qty > 10) {
            alert('You can request up to 10 numbers at once.');
            return;
        }
        alert(`Successfully requested ${qty} numbers!`);
        
        const kpiNewNumbers = document.getElementById('kpiNewNumbers');
        if(kpiNewNumbers) {
            let current = parseInt(kpiNewNumbers.innerText.replace(/,/g, ''));
            this.setStat('kpiNewNumbers', current + qty);
        }
    },

    updateUserUI(user) {
        document.getElementById('headerWelcomeText').innerText = `Welcome, ${user.fullName}`;
        document.getElementById('sidebarUserName').innerText = user.fullName;
        document.getElementById('sidebarUserRole').innerText = user.role;
        document.getElementById('sidebarUserAvatarFallback').innerText = user.username.substring(0, 2).toUpperCase();
        document.getElementById('headerUserAvatarFallback').innerText = user.username.substring(0, 2).toUpperCase();
        
        // Initial route setup
        const role = localStorage.getItem('simless_role');
        if(role !== 'owner' && (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/'))) {
            this.switchView('view-sms-ranges');
        }

        const addRateBtn = document.getElementById('addRateBtn');
        if(addRateBtn) {
            addRateBtn.style.display = role === 'owner' ? 'flex' : 'none';
        }

        this.renderMyActivity();
        this.renderAgentManagement();
        this.renderClients();
        this.renderSmsTestPanel();
        this.renderSmsCdr();
    },

    updateStatsUI(stats) {
        this.setStat('statTodaySMS', stats.todaySMS);
        this.setStat('statYesterdaySMS', stats.yesterdaySMS);
        this.setStat('statThisWeekSMS', stats.thisWeekSMS);
        this.setStat('statThisMonthSMS', stats.thisMonthSMS);
        this.setStat('kpiNewAccounts', stats.newAccounts);
        this.setStat('kpiNewNumbers', stats.newNumbers);
        this.setStat('kpiTodaySMS', stats.todaySMS);

        // Update real Agent specific stats
        const username = localStorage.getItem('simless_user');
        const agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
        const agent = agents.find(a => a.username === username);
        
        if (agent) {
            const balanceEl = document.getElementById('agentStatBalance');
            if (balanceEl) balanceEl.innerText = '$' + parseFloat(agent.balance || 0).toFixed(2);
            
            const activeNumbers = (JSON.parse(localStorage.getItem('simless_my_numbers')) || []).length;
            const numbersEl = document.getElementById('agentStatActiveNumbers');
            if (numbersEl) numbersEl.innerText = activeNumbers;

            const activityBody = document.getElementById('agentActivityTableBody');
            if (activityBody) {
                const history = agent.loginHistory || [];
                if (history.length === 0) {
                    activityBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-[var(--text-secondary)] font-medium">No activity found.</td></tr>';
                } else {
                    activityBody.innerHTML = history.slice(0,5).map(h => 
                        '<tr class="hover:bg-[var(--color-primary-light)] transition-colors">' +
                            '<td class="p-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">' + h.time + '</td>' +
                            '<td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">Login</td>' +
                            '<td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">' + (h.ip || 'Unknown') + '</td>' +
                            '<td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">' + (h.device || 'Unknown') + '</td>' +
                        '</tr>'
                    ).join('');
                }
            }
        }
    },

    setStat(elementId, targetValue) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.setAttribute('data-target', targetValue);
        
        if (targetValue > 0) {
            this.animateValue(el, 0, targetValue, 2000);
            const circle = document.getElementById(elementId.replace('kpi', 'kpiCircle'));
            if (circle) this.animateCircle(circle, Math.min((targetValue / 100) * 100, 100) || 50);
        } else {
            el.innerHTML = '0';
        }
    },

    animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            obj.innerHTML = Math.floor(easeProgress * (end - start) + start).toLocaleString();
            if (progress < 1) window.requestAnimationFrame(step);
            else obj.innerHTML = end.toLocaleString();
        };
        window.requestAnimationFrame(step);
    },

    animateCircle(el, percent) {
        const circumference = 2 * Math.PI * 36;
        const offset = circumference - (percent / 100) * circumference;
        el.style.strokeDasharray = `${circumference} ${circumference}`;
        el.style.strokeDashoffset = circumference;
        el.getBoundingClientRect();
        el.style.strokeDashoffset = offset;
    },

    getChartColors() {
        const isDark = this.htmlElement.classList.contains('dark');
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
        return {
            textColor: isDark ? '#94a3b8' : '#64748b',
            gridColor: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.6)',
            lineColor: primaryColor || '#16a34a', 
            gradientStart: isDark ? 'rgba(22, 163, 74, 0.25)' : 'rgba(22, 163, 74, 0.2)', // Slightly hardcoded for visual consistency, but line is dynamic
            gradientEnd: 'rgba(22, 163, 74, 0.0)'
        };
    },

    initChart() {
        if (!this.chartCtx) return;
        const ctx = this.chartCtx.getContext('2d');
        const colors = this.getChartColors();
        const gradient = ctx.createLinearGradient(0, 0, 0, 350);
        gradient.addColorStop(0, colors.gradientStart);
        gradient.addColorStop(1, colors.gradientEnd);

        this.smsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'SMS Traffic',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: colors.lineColor,
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: colors.lineColor,
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4 
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { displayColors: false } },
                scales: {
                    y: { beginAtZero: true, max: 10, grid: { color: colors.gridColor, drawBorder: false }, ticks: { color: colors.textColor } },
                    x: { grid: { display: false }, ticks: { color: colors.textColor } }
                }
            }
        });
    },

    updateChartUI(data) {
        const emptyState = document.getElementById('chartEmptyState');
        if (!data || data.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');
            this.smsChart.data.datasets[0].data = data;
            const maxVal = Math.max(...data);
            this.smsChart.options.scales.y.max = maxVal + Math.ceil(maxVal * 0.2);
            this.smsChart.update();
        }
    },

    updateChartTheme() {
        if (!this.smsChart) return;
        const colors = this.getChartColors();
        this.smsChart.options.scales.y.grid.color = colors.gridColor;
        this.smsChart.options.scales.y.ticks.color = colors.textColor;
        this.smsChart.options.scales.x.ticks.color = colors.textColor;
        this.smsChart.data.datasets[0].borderColor = colors.lineColor;
        this.smsChart.update();
    },

    openAppModal() {
        document.getElementById('appForm').reset();
        document.getElementById('appModalTitle').innerText = "Add New Application";
        document.getElementById('appActionType').value = "create";
        document.getElementById('appOriginalCode').value = "";
        
        document.getElementById('appModal').classList.remove('hidden');
        document.getElementById('appModal').classList.add('flex');
    },

    openCreateAgentModal() {
        document.getElementById('createAgentForm').reset();
        document.getElementById('createAgentModal').classList.remove('hidden');
        document.getElementById('createAgentModal').classList.add('flex');
    },

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
        document.getElementById(modalId).classList.remove('flex');
    },


    renderAgentDashboardStats() {
        const username = localStorage.getItem('simless_user');
        const agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
        const agent = agents.find(a => a.username === username);
        if (!agent) return;

        const balanceEl = document.getElementById('agentStatBalance');
        if (balanceEl) balanceEl.innerText = `$${parseFloat(agent.balance).toFixed(2)}`;

        let cdrData = JSON.parse(localStorage.getItem('simless_sms_cdr')) || [];
        this.setStat('agentStatSmsToday', 145);
        this.setStat('agentStatSmsWeek', 980);
        this.setStat('agentStatSmsMonth', 4250);

        this.setStat('agentStatActiveNumbers', 12);

        const activityBody = document.getElementById('agentActivityTableBody');
        if (activityBody) {
            const history = agent.loginHistory || [];
            if (history.length === 0) {
                activityBody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-[var(--text-secondary)] font-medium">No activity found.</td></tr>`;
            } else {
                activityBody.innerHTML = history.slice(0,5).map(h => `
                    <tr class="hover:bg-[var(--color-primary-light)] transition-colors">
                        <td class="p-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">${h.time}</td>
                        <td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">Login</td>
                        <td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">${h.ip || 'Unknown'}</td>
                        <td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">${h.device || 'Unknown'}</td>
                    </tr>
                `).join('');
            }
        }
    },
    renderAgentManagement() {
        const tbody = document.getElementById('agentMgmtTableBody');
        if (!tbody) return;
        
        const agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
        
        if (agents.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-[var(--text-secondary)] font-medium">No agents found. Click 'Create Agent' to add one.</td></tr>`;
            return;
        }
        
        tbody.innerHTML = agents.map((agent) => `
            <tr class="hover:bg-[var(--color-primary-light)] transition-colors">
                <td class="p-4 whitespace-nowrap text-[var(--text-primary)] font-semibold">${agent.name || '-'}</td>
                <td class="p-4 whitespace-nowrap font-medium text-[var(--text-primary)]">${agent.username}</td>
                <td class="p-4 whitespace-nowrap font-bold text-green-500">$${parseFloat(agent.balance).toFixed(2)}</td>
                <td class="p-4 whitespace-nowrap text-[var(--text-secondary)] font-medium">$${parseFloat(agent.creditLimit).toFixed(2)}</td>
                <td class="p-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-lg ${agent.status === 'Active' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}">${agent.status}</span>
                </td>
                <td class="p-4 whitespace-nowrap text-right space-x-2">
                    <button onclick="App.openBalanceModal('${agent.username}', 'add')" class="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 transition-colors" title="Add Balance">
                        <i data-lucide="plus-circle" class="w-4 h-4"></i>
                    </button>
                    <button onclick="App.openBalanceModal('${agent.username}', 'deduct')" class="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 transition-colors" title="Deduct Balance">
                        <i data-lucide="minus-circle" class="w-4 h-4"></i>
                    </button>
                    <button onclick="App.viewTransactionHistory('${agent.username}')" class="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 transition-colors" title="Transaction History">
                        <i data-lucide="list-ordered" class="w-4 h-4"></i>
                    </button>
                    <button onclick="App.toggleAgentStatus('${agent.username}')" class="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors" title="${agent.status === 'Active' ? 'Disable Agent' : 'Enable Agent'}">
                        <i data-lucide="power" class="w-4 h-4"></i>
                    </button>
                    <button onclick="App.viewAgentHistory('${agent.username}')" class="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 transition-colors" title="Login History">
                        <i data-lucide="history" class="w-4 h-4"></i>
                    </button>
                    <button onclick="App.deleteAgent('${agent.username}')" class="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors" title="Delete Agent">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        lucide.createIcons();
    },

    openBalanceModal(username, type) {
        document.getElementById('balanceAgentUsername').value = username;
        document.getElementById('balanceActionType').value = type;
        document.getElementById('balanceAmount').value = '';
        document.getElementById('balanceModalTitle').innerText = type === 'add' ? `Add Balance to ${username}` : `Deduct Balance from ${username}`;
        
        const btn = document.getElementById('balanceSubmitBtn');
        if (type === 'add') {
            btn.classList.remove('bg-orange-500');
            btn.classList.add('bg-[var(--color-primary)]');
            btn.innerText = 'Add Balance';
        } else {
            btn.classList.remove('bg-[var(--color-primary)]');
            btn.classList.add('bg-orange-500');
            btn.innerText = 'Deduct Balance';
        }

        document.getElementById('balanceModal').classList.remove('hidden');
        document.getElementById('balanceModal').classList.add('flex');
    },

    disableAgent(username) {
        let agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
        const index = agents.findIndex(a => a.username === username);
        if(index > -1) {
            agents[index].status = agents[index].status === 'Active' ? 'Disabled' : 'Active';
            localStorage.setItem('simless_agents', JSON.stringify(agents));
            this.renderAgentManagement();
        }
    },

    renderClients() {
        const clientsBody = document.getElementById('myClientsTableBody');
        if (!clientsBody) return;

        let clients = JSON.parse(localStorage.getItem('simless_clients')) || [];

        if (clients.length === 0) {
            clientsBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-[var(--text-secondary)] font-medium">No clients created yet.</td></tr>`;
            return;
        }

        clientsBody.innerHTML = clients.map(client => `
            <tr class="hover:bg-[var(--color-primary-light)] transition-colors">
                <td class="p-4 whitespace-nowrap text-sm font-bold text-[var(--text-primary)]">${client.name}</td>
                <td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">@${client.username}</td>
                <td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                    <span class="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onclick="alert('Password: ${client.password}')">••••••••</span>
                </td>
                <td class="p-4 whitespace-nowrap text-sm font-bold text-[var(--color-primary)]">$${client.balance.toFixed(2)}</td>
                <td class="p-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-bold rounded-lg ${client.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}">${client.status}</span>
                </td>
                <td class="p-4 whitespace-nowrap text-right space-x-2">
                    <button onclick="App.viewClientStats('${client.username}')" class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Statistics">
                        <i data-lucide="bar-chart-2" class="w-4 h-4"></i>
                    </button>
                    <button onclick="App.openClientModal('${client.username}')" class="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors" title="Edit Client">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <button onclick="App.disableClient('${client.username}')" class="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors" title="${client.status === 'Active' ? 'Disable' : 'Enable'}">
                        <i data-lucide="${client.status === 'Active' ? 'ban' : 'check-circle'}" class="w-4 h-4"></i>
                    </button>
                    <button onclick="App.deleteClient('${client.username}')" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Client">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    },

    openClientModal(username = null) {
        const form = document.getElementById('clientForm');
        form.reset();
        
        if (username) {
            document.getElementById('clientModalTitle').innerText = "Edit Client";
            document.getElementById('clientActionType').value = "edit";
            document.getElementById('clientOriginalUsername').value = username;
            
            let clients = JSON.parse(localStorage.getItem('simless_clients')) || [];
            const client = clients.find(c => c.username === username);
            if (client) {
                document.getElementById('clientName').value = client.name;
                document.getElementById('clientUsername').value = client.username;
                document.getElementById('clientPassword').value = client.password;
                document.getElementById('clientBalance').value = client.balance;
                document.getElementById('clientStatus').value = client.status;
            }
        } else {
            document.getElementById('clientModalTitle').innerText = "Create New Client";
            document.getElementById('clientActionType').value = "create";
            document.getElementById('clientOriginalUsername').value = "";
        }
        
        document.getElementById('clientModal').classList.remove('hidden');
        document.getElementById('clientModal').classList.add('flex');
    },

    deleteClient(username) {
        if(confirm(`Are you sure you want to delete client ${username}?`)) {
            let clients = JSON.parse(localStorage.getItem('simless_clients')) || [];
            clients = clients.filter(c => c.username !== username);
            localStorage.setItem('simless_clients', JSON.stringify(clients));
            this.renderClients();
        }
    },

    disableClient(username) {
        let clients = JSON.parse(localStorage.getItem('simless_clients')) || [];
        const index = clients.findIndex(c => c.username === username);
        if(index > -1) {
            clients[index].status = clients[index].status === 'Active' ? 'Disabled' : 'Active';
            localStorage.setItem('simless_clients', JSON.stringify(clients));
            this.renderClients();
        }
    },

    viewClientStats(username) {
        let clients = JSON.parse(localStorage.getItem('simless_clients')) || [];
        const client = clients.find(c => c.username === username);
        if(!client) return;

        document.getElementById('statsClientName').innerText = client.name;
        
        document.getElementById('statsTotalSms').innerText = '0';
        document.getElementById('statsMonthlySms').innerText = '0';
        document.getElementById('statsDailySms').innerText = '0';

        const tbody = document.getElementById('statsCountryTableBody');
        tbody.innerHTML = `<tr><td colspan="2" class="p-4 text-center text-[var(--text-secondary)]">No statistics available</td></tr>`;

        document.getElementById('clientStatsModal').classList.remove('hidden');
        document.getElementById('clientStatsModal').classList.add('flex');
    },

    renderSmsTestPanel() {
        const tbody = document.getElementById('smsTestTableBody');
        if (!tbody) return;

        let messages = JSON.parse(localStorage.getItem('simless_test_sms')) || [];

        if (messages.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-[var(--text-secondary)] font-medium">No messages received yet.</td></tr>`;
            return;
        }

        const maskPhone = (phone) => {
            if (!phone || phone.length < 8) return phone;
            const start = phone.substring(0, 6);
            const end = phone.substring(phone.length - 3);
            return `${start}****${end}`;
        };

        const maskOtp = (otp) => {
            if (!otp || otp.length < 4) return otp;
            // Examples: 123*** or ****56
            if (Math.random() > 0.5) {
                return otp.substring(0, 3) + '***';
            } else {
                return '****' + otp.substring(otp.length - 2);
            }
        };

        tbody.innerHTML = messages.map(msg => `
            <tr class="hover:bg-[var(--color-primary-light)] transition-colors">
                <td class="p-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">${msg.time}</td>
                <td class="p-4 whitespace-nowrap text-sm font-bold text-[var(--color-primary)]">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <i data-lucide="message-square" class="w-3 h-3 text-[var(--text-secondary)]"></i>
                        </div>
                        ${msg.service}
                    </div>
                </td>
                <td class="p-4 whitespace-nowrap text-sm font-mono text-[var(--text-secondary)]">${maskPhone(msg.phone)}</td>
                <td class="p-4 whitespace-nowrap text-sm font-mono font-bold tracking-widest text-[var(--text-primary)]">${maskOtp(msg.otp)}</td>
            </tr>
        `).join('');
        lucide.createIcons();
    },

    renderSmsCdr() {
        const tbody = document.getElementById('smsCdrTableBody');
        if (!tbody) return;

        let cdrData = JSON.parse(localStorage.getItem('simless_sms_cdr')) || [];

        if (cdrData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-[var(--text-secondary)] font-medium">No CDR data available.</td></tr>`;
            return;
        }

        tbody.innerHTML = cdrData.map(cdr => `
            <tr class="hover:bg-[var(--color-primary-light)] transition-colors">
                <td class="p-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">${cdr.time}</td>
                <td class="p-4 whitespace-nowrap text-sm font-bold text-[var(--text-primary)]">${cdr.app}</td>
                <td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">${cdr.country}</td>
                <td class="p-4 whitespace-nowrap text-sm font-mono text-[var(--text-primary)]">${cdr.phone}</td>
                <td class="p-4 whitespace-nowrap text-lg font-mono font-bold tracking-widest text-[var(--color-primary)]">${cdr.otp}</td>
                <td class="p-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-bold rounded-lg ${cdr.status === 'Verified' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}">${cdr.status}</span>
                </td>
                <td class="p-4 whitespace-nowrap">
                    <button onclick="navigator.clipboard.writeText('${cdr.otp}'); alert('OTP copied to clipboard!');" class="p-2 text-slate-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors" title="Copy OTP">
                        <i data-lucide="copy" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    },

    toggleAgentStatus(username) {
        let agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
        const index = agents.findIndex(a => a.username === username);
        if (index > -1) {
            agents[index].status = agents[index].status === 'Active' ? 'Disabled' : 'Active';
            localStorage.setItem('simless_agents', JSON.stringify(agents));
            this.renderAgentManagement();
        }
    },

    deleteAgent(username) {
        if (confirm(`Are you sure you want to delete agent '${username}'?`)) {
            let agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
            agents = agents.filter(a => a.username !== username);
            localStorage.setItem('simless_agents', JSON.stringify(agents));
            this.renderAgentManagement();
        }
    },

    viewAgentHistory(username) {
        const agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
        const agent = agents.find(a => a.username === username);
        if (!agent) return;

        document.getElementById('historyAgentName').innerText = username;
        
        const historyBody = document.getElementById('agentHistoryTableBody');
        const history = agent.loginHistory || [];
        
        if (history.length === 0) {
            historyBody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-[var(--text-secondary)]">No login history available.</td></tr>`;
        } else {
            historyBody.innerHTML = history.map(h => `
                <tr class="hover:bg-[var(--color-primary-light)] transition-colors">
                    <td class="p-4 text-sm text-[var(--text-primary)] font-medium">${h.time}</td>
                    <td class="p-4 text-sm text-blue-500 font-mono">${h.ip}</td>
                    <td class="p-4 text-sm text-[var(--text-secondary)]">${h.device}</td>
                </tr>
            `).join('');
        }

        document.getElementById('agentHistoryModal').classList.remove('hidden');
        document.getElementById('agentHistoryModal').classList.add('flex');
    },

    viewTransactionHistory(username) {
        const agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
        const agent = agents.find(a => a.username === username);
        if (!agent) return;

        document.getElementById('txHistoryAgentName').innerText = username;
        
        const historyBody = document.getElementById('transactionHistoryTableBody');
        const transactions = agent.transactionHistory || [];
        
        if (transactions.length === 0) {
            historyBody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-[var(--text-secondary)] font-medium">No transactions available.</td></tr>`;
        } else {
            historyBody.innerHTML = transactions.map(t => `
                <tr class="hover:bg-[var(--color-primary-light)] transition-colors">
                    <td class="p-4 text-sm text-[var(--text-primary)] font-medium">${t.time}</td>
                    <td class="p-4 text-sm font-semibold ${t.type === 'Add' ? 'text-green-500' : 'text-orange-500'}">${t.type}</td>
                    <td class="p-4 text-sm text-[var(--text-primary)]">$${parseFloat(t.amount).toFixed(2)}</td>
                    <td class="p-4 text-sm text-[var(--text-secondary)]">${t.by}</td>
                </tr>
            `).join('');
        }

        document.getElementById('transactionHistoryModal').classList.remove('hidden');
        document.getElementById('transactionHistoryModal').classList.add('flex');
    },

    renderAppManagement() {
        const tbody = document.getElementById('appMgmtTableBody');
        if (!tbody) return;

        let apps = JSON.parse(localStorage.getItem('simless_apps'));
        if (!apps) {
            apps = [
                { name: 'Service Platform 1', code: 'SRV01', status: 'Active' },
                { name: 'Service Platform 2', code: 'SRV02', status: 'Active' },
                { name: 'Service Platform 3', code: 'SRV03', status: 'Active' },
                { name: 'Service Platform 4', code: 'SRV04', status: 'Disabled' }
            ];
            localStorage.setItem('simless_apps', JSON.stringify(apps));
        }

        tbody.innerHTML = apps.map(app => {
            const statusClass = app.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20';
            return `
                <tr class="hover:bg-[var(--color-primary-light)] transition-colors">
                    <td class="p-4 text-sm font-bold text-[var(--text-primary)]">${app.name}</td>
                    <td class="p-4 text-sm text-[var(--text-secondary)] font-mono">${app.code}</td>
                    <td class="p-4">
                        <span class="px-3 py-1 text-xs font-bold rounded-full border ${statusClass}">
                            ${app.status}
                        </span>
                    </td>
                    <td class="p-4 text-right">
                        <button onclick="App.toggleAppStatus('${app.code}')" class="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="${app.status === 'Active' ? 'Disable' : 'Enable'}">
                            <i data-lucide="${app.status === 'Active' ? 'pause' : 'play'}" class="w-4 h-4"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        lucide.createIcons();
    },

    toggleAppStatus(code) {
        let apps = JSON.parse(localStorage.getItem('simless_apps')) || [];
        const index = apps.findIndex(a => a.code === code);
        if (index > -1) {
            apps[index].status = apps[index].status === 'Active' ? 'Disabled' : 'Active';
            localStorage.setItem('simless_apps', JSON.stringify(apps));
            this.renderAppManagement();
        }
    },

    openRateModal(id = null) {
        document.getElementById('rateForm').reset();
        document.getElementById('rateId').value = '';
        document.getElementById('rateModalTitle').innerText = 'Add New Rate';
        
        if (id) {
            const rates = JSON.parse(localStorage.getItem('simless_rates')) || [];
            const rate = rates.find(r => r.id === id);
            if (rate) {
                document.getElementById('rateId').value = rate.id;
                document.getElementById('rateCountry').value = rate.country;
                document.getElementById('ratePrefix').value = rate.prefix;
                document.getElementById('ratePrice').value = rate.price;
                document.getElementById('rateStatus').value = rate.status;
                document.getElementById('rateModalTitle').innerText = 'Edit Rate';
            }
        }
        
        document.getElementById('rateModal').classList.remove('hidden');
        document.getElementById('rateModal').classList.add('flex');
    },

    toggleRateStatus(id) {
        let rates = JSON.parse(localStorage.getItem('simless_rates')) || [];
        const index = rates.findIndex(r => r.id === id);
        if(index > -1) {
            rates[index].status = rates[index].status === 'Active' ? 'Disabled' : 'Active';
            localStorage.setItem('simless_rates', JSON.stringify(rates));
            this.renderSmsRateCard();
        }
    },

    renderSmsRateCard() {
        const tbody = document.getElementById('smsRateCardTableBody');
        if (!tbody) return;

        const role = localStorage.getItem('simless_role');
        let rates = JSON.parse(localStorage.getItem('simless_rates')) || [];

        if (rates.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-[var(--text-secondary)] font-medium">No rates configured.</td></tr>`;
            return;
        }

        tbody.innerHTML = rates.map(rate => {
            const statusClass = rate.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20';
            
            let actions = '';
            if (role === 'owner') {
                actions = `
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="App.toggleRateStatus('${rate.id}')" class="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Toggle Status">
                            <i data-lucide="${rate.status === 'Active' ? 'pause' : 'play'}" class="w-4 h-4"></i>
                        </button>
                        <button onclick="App.openRateModal('${rate.id}')" class="p-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Edit">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                    </div>
                `;
            }

            return `
                <tr class="hover:bg-[var(--color-primary-light)] transition-colors">
                    <td class="p-4 text-sm font-bold text-[var(--text-primary)]">${rate.country}</td>
                    <td class="p-4 text-sm text-[var(--text-secondary)]">${rate.prefix}</td>
                    <td class="p-4 text-sm font-bold text-[var(--color-primary)]">$${Number(rate.price).toFixed(4)}</td>
                    <td class="p-4">
                        <span class="px-3 py-1 text-xs font-bold rounded-full border ${statusClass}">
                            ${rate.status}
                        </span>
                    </td>
                    <td class="p-4 text-right">
                        ${actions}
                    </td>
                </tr>
            `;
        }).join('');
        lucide.createIcons();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();

    const createAgentForm = document.getElementById('createAgentForm');
    if(createAgentForm) {
        createAgentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('agentName').value.trim();
            const username = document.getElementById('agentUsername').value.trim();
            const password = document.getElementById('agentPassword').value.trim();
            const balance = parseFloat(document.getElementById('agentBalance').value) || 0;
            const creditLimit = parseFloat(document.getElementById('agentCreditLimit').value) || 0;
            const status = document.getElementById('agentStatus').value;

            let agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
            if(agents.find(a => a.username === username)) {
                alert("Username already exists!");
                return;
            }

            agents.push({
                name, username, password, balance, creditLimit, status, loginHistory: [], transactionHistory: []
            });
            localStorage.setItem('simless_agents', JSON.stringify(agents));
            
            App.closeModal('createAgentModal');
            App.renderAgentManagement();
        });
    }

    const appForm = document.getElementById('appForm');
    if (appForm) {
        appForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const actionType = document.getElementById('appActionType').value;
            const originalCode = document.getElementById('appOriginalCode').value;
            
            const name = document.getElementById('appName').value.trim();
            const code = document.getElementById('appCode').value.trim();
            const status = document.getElementById('appStatus').value;

            let apps = JSON.parse(localStorage.getItem('simless_apps')) || [];
            
            if (actionType === 'create') {
                if(apps.find(a => a.code === code)) {
                    alert("Service Code already exists!");
                    return;
                }
                apps.push({ name, code, status });
            } else {
                const index = apps.findIndex(a => a.code === originalCode);
                if (index > -1) {
                    if (originalCode !== code && apps.find(a => a.code === code)) {
                        alert("Service Code already exists!");
                        return;
                    }
                    apps[index] = { name, code, status };
                }
            }

            localStorage.setItem('simless_apps', JSON.stringify(apps));
            App.closeModal('appModal');
            App.renderAppManagement();
        });
    }

    const rateForm = document.getElementById('rateForm');
    if (rateForm) {
        rateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('rateId').value;
            const country = document.getElementById('rateCountry').value.trim();
            const prefix = document.getElementById('ratePrefix').value.trim();
            const price = parseFloat(document.getElementById('ratePrice').value) || 0;
            const status = document.getElementById('rateStatus').value;

            let rates = JSON.parse(localStorage.getItem('simless_rates')) || [];
            
            if (id) {
                const index = rates.findIndex(r => r.id === id);
                if (index > -1) {
                    rates[index] = { ...rates[index], country, prefix, price, status };
                }
            } else {
                rates.push({
                    id: 'rate_' + Date.now(),
                    country, prefix, price, status
                });
            }
            
            localStorage.setItem('simless_rates', JSON.stringify(rates));
            App.closeModal('rateModal');
            App.renderSmsRateCard();
        });
    }

    const clientForm = document.getElementById('clientForm');
    if (clientForm) {
        clientForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const actionType = document.getElementById('clientActionType').value;
            const originalUsername = document.getElementById('clientOriginalUsername').value;
            
            const name = document.getElementById('clientName').value.trim();
            const username = document.getElementById('clientUsername').value.trim();
            const password = document.getElementById('clientPassword').value.trim();
            const balance = parseFloat(document.getElementById('clientBalance').value) || 0;
            const status = document.getElementById('clientStatus').value;

            let clients = JSON.parse(localStorage.getItem('simless_clients')) || [];
            
            if (actionType === 'create') {
                if(clients.find(c => c.username === username)) {
                    alert("Username already exists!");
                    return;
                }
                clients.push({ name, username, password, balance, status });
            } else {
                const index = clients.findIndex(c => c.username === originalUsername);
                if (index > -1) {
                    if (originalUsername !== username && clients.find(c => c.username === username)) {
                        alert("Username already exists!");
                        return;
                    }
                    clients[index] = { name, username, password, balance, status };
                }
            }

            localStorage.setItem('simless_clients', JSON.stringify(clients));
            App.closeModal('clientModal');
            App.renderClients();
        });
    }

    const balanceForm = document.getElementById('balanceForm');
    if(balanceForm) {
        balanceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('balanceAgentUsername').value;
            const type = document.getElementById('balanceActionType').value;
            const amount = parseFloat(document.getElementById('balanceAmount').value) || 0;
            
            const currentUser = localStorage.getItem('simless_user') || 'Owner';
            const time = new Date().toLocaleString();

            let agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
            const index = agents.findIndex(a => a.username === username);
            if(index > -1) {
                agents[index].transactionHistory = agents[index].transactionHistory || [];
                
                if (type === 'add') {
                    agents[index].balance += amount;
                    agents[index].transactionHistory.unshift({ time, type: 'Add', amount, by: currentUser });
                } else if (type === 'deduct') {
                    if (agents[index].balance >= amount) {
                        agents[index].balance -= amount;
                        agents[index].transactionHistory.unshift({ time, type: 'Deduct', amount, by: currentUser });
                    } else {
                        alert("Insufficient balance!");
                        return;
                    }
                }
                localStorage.setItem('simless_agents', JSON.stringify(agents));
                App.closeModal('balanceModal');
                App.renderAgentManagement();
            }
        });
    }
});
