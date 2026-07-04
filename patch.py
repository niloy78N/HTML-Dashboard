import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject fetchRealBalance into init() or fetchData()
fetch_data_start = content.find('fetchData() {')
if fetch_data_start != -1:
    inject_point = content.find('this.populateViews();', fetch_data_start)
    if inject_point != -1:
        new_inject = """this.fetchRealBalance();
        this.populateViews();"""
        content = content[:inject_point] + new_inject + content[inject_point + len('this.populateViews();'):]

# 2. Add fetchRealBalance function
fetch_balance_func = """
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
"""
idx = content.find('    fetchNumbers(grid)')
if idx != -1:
    content = content[:idx] + fetch_balance_func + content[idx:]

# 3. Modify fetchNumbers to use real API
old_fetch = '''    fetchNumbers(grid) {
        try {
            const data = JSON.parse(localStorage.getItem('simless_api_numbers') || '[]');

            if (!data || data.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-1 md:col-span-2 lg:col-span-3 glass-card p-12 flex flex-col items-center justify-center text-center">
                        <div class="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                            <i data-lucide="inbox" class="w-8 h-8 text-[var(--text-secondary)]"></i>
                        </div>
                        <h3 class="text-xl font-bold text-[var(--text-primary)] mb-2">No numbers available</h3>
                        <p class="text-[var(--text-secondary)] max-w-md">There are currently no numbers available in the system.</p>
                    </div>
                `;
                lucide.createIcons();
                return;
            }

            grid.innerHTML = data.map(item => `
                <div class="glass-card p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl filter drop-shadow-sm">${item.flag}</span>
                            <div>
                                <h3 class="font-bold text-[var(--text-primary)] text-lg">${item.country}</h3>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono tracking-wider">
                                        ${item.code}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between mt-auto pt-6 border-t border-[var(--border-color)]">
                        <div class="flex flex-col">
                            <span class="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Stock</span>
                            <span class="text-sm font-bold text-green-500">${item.available.toLocaleString()}</span>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Price</span>
                            <span class="text-lg font-display font-bold text-[var(--color-primary)]">$${item.price.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-[var(--border-color)] flex gap-2">
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
    },'''

new_fetch = '''    async fetchNumbers(grid) {
        try {
            grid.innerHTML = '<div class="col-span-full text-center text-[var(--text-secondary)]">Loading real-time availability from 5sim...</div>';
            
            const response = await fetch('https://5sim.net/v1/guest/prices');
            if(!response.ok) throw new Error('API Error');
            const prices = await response.json();
            
            const targetCountries = ['england', 'russia', 'usa', 'germany', 'france', 'canada'];
            const targetProducts = ['whatsapp', 'telegram', 'facebook'];
            
            let displayItems = [];
            
            targetCountries.forEach(country => {
                if(prices[country] && prices[country]['any']) {
                    targetProducts.forEach(product => {
                        if(prices[country]['any'][product]) {
                            const details = prices[country]['any'][product];
                            if(details.count > 0) {
                                displayItems.push({
                                    country: country,
                                    product: product,
                                    operator: 'any',
                                    available: details.count,
                                    price: details.cost,
                                    flag: '🏳️'
                                });
                            }
                        }
                    });
                }
            });

            if (displayItems.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-1 md:col-span-2 lg:col-span-3 glass-card p-12 flex flex-col items-center justify-center text-center">
                        <div class="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                            <i data-lucide="inbox" class="w-8 h-8 text-[var(--text-secondary)]"></i>
                        </div>
                        <h3 class="text-xl font-bold text-[var(--text-primary)] mb-2">No numbers available</h3>
                        <p class="text-[var(--text-secondary)] max-w-md">There are currently no numbers available in the 5sim system for our target products.</p>
                    </div>
                `;
                lucide.createIcons();
                return;
            }

            grid.innerHTML = displayItems.map(item => `
                <div class="glass-card p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl filter drop-shadow-sm">${item.flag}</span>
                            <div>
                                <h3 class="font-bold text-[var(--text-primary)] text-lg capitalize">${item.country}</h3>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono tracking-wider capitalize">
                                        ${item.product}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between mt-auto pt-6 border-t border-[var(--border-color)]">
                        <div class="flex flex-col">
                            <span class="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Stock</span>
                            <span class="text-sm font-bold text-green-500">${item.available.toLocaleString()}</span>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Price (RUB)</span>
                            <span class="text-lg font-display font-bold text-[var(--color-primary)]">₽${item.price.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-[var(--border-color)] flex gap-2">
                        <button onclick="App.requestNumbers('${item.country}', '${item.operator}', '${item.product}', ${item.price})" class="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            <i data-lucide="shopping-cart" class="w-4 h-4 text-white"></i>
                            Buy
                        </button>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        } catch (error) {
            grid.innerHTML = `<div class="col-span-full text-center text-red-500">Error fetching numbers from 5sim.</div>`;
            console.error(error);
        }
    },'''
content = content.replace(old_fetch, new_fetch)

# 4. Modify requestNumbers
old_req = '''    requestNumbers() {
        alert("Numbers requested successfully! Updating dashboard counters...");
        const kpiNewNumbers = document.getElementById('kpiNewNumbers');
        if(kpiNewNumbers) {
            let current = parseInt(kpiNewNumbers.innerText.replace(/,/g, ''));
            this.setStat('kpiNewNumbers', current + 1);
        }
    },'''

new_req = '''    async requestNumbers(country, operator, product, price) {
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
    },'''
content = content.replace(old_req, new_req)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched app.js successfully')
