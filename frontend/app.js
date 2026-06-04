/**
 * Client Lead Management System
 * Frontend Logic
 */

// Configuration
const API_URL = 'http://localhost:5000/api/leads';

// Local State (Fallback if API is unavailable)
let leads = [];
let nextId = 1;

// DOM Elements (Login)
const loginView = document.getElementById('login-view');
const crmView = document.getElementById('crm-view');
const loginForm = document.getElementById('login-form');
const loginUsername = document.getElementById('username');
const loginPassword = document.getElementById('password');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

// DOM Elements (CRM)
const form = document.getElementById('lead-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const leadsTbody = document.getElementById('leads-tbody');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');

const statTotal = document.getElementById('stat-total');
const statNew = document.getElementById('stat-new');
const statContacted = document.getElementById('stat-contacted');
const statConverted = document.getElementById('stat-converted');

const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

// Current lead to delete
let leadToDeleteId = null;

/**
 * Initialize the application
 */
async function init() {
    setupAuthListeners();
    checkAuthState();
}

function checkAuthState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        loginView.classList.add('hidden');
        crmView.classList.remove('hidden');
        initCRM();
    } else {
        loginView.classList.remove('hidden');
        crmView.classList.add('hidden');
    }
}

async function initCRM() {
    await fetchLeads();
    setupEventListeners();
    render();
}

/**
 * Authentication Logic
 */
function setupAuthListeners() {
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

function handleLogin(e) {
    e.preventDefault();
    const user = loginUsername.value;
    const pass = loginPassword.value;

    if (user === 'admin' && pass === 'admin123') {
        localStorage.setItem('isLoggedIn', 'true');
        loginError.classList.add('hidden');
        loginForm.reset();
        checkAuthState();
    } else {
        loginError.classList.remove('hidden');
    }
}

function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    checkAuthState();
}

/**
 * API Service Wrapper
 * All API calls go to http://localhost:5000/api/leads
 */

function setTableLoading() {
    leadsTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Loading leads...</td></tr>`;
}

function setTableError(message) {
    leadsTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-red);">${message}</td></tr>`;
}

async function fetchLeads() {
    try {
        setTableLoading();
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        leads = await response.json();
        render(); // Re-render table with data
    } catch (error) {
        console.error('Error fetching leads:', error);
        setTableError('Failed to load leads from the server. Please ensure the backend is running.');
    }
}

async function addLeadAPI(lead) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
        });
        if (!response.ok) throw new Error('Failed to add lead');
        const newLead = await response.json();
        leads.push(newLead);
        render();
    } catch (error) {
        console.error('Error adding lead:', error);
        alert('Failed to add lead: ' + error.message);
    }
}

async function updateLeadAPI(id, updatedLead) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedLead)
        });
        if (!response.ok) throw new Error('Failed to update lead');
        const updated = await response.json();
        const index = leads.findIndex(l => (l.id == id || l._id == id));
        if (index !== -1) {
            leads[index] = updated;
            render();
        }
    } catch (error) {
        console.error('Error updating lead:', error);
        alert('Failed to update lead: ' + error.message);
    }
}

async function deleteLeadAPI(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete lead');
        leads = leads.filter(l => (l.id != id && l._id != id));
        render();
    } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead: ' + error.message);
    }
}

/**
 * Event Listeners
 */
function setupEventListeners() {
    form.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', render);
    filterStatus.addEventListener('change', render);
    
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
        leadToDeleteId = null;
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (leadToDeleteId) {
            await deleteLeadAPI(leadToDeleteId);
            deleteModal.classList.add('hidden');
            leadToDeleteId = null;
        }
    });
}

/**
 * Form Handling
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('lead-id').value;
    const leadData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        source: document.getElementById('source').value,
        status: document.getElementById('status').value,
        notes: document.getElementById('notes').value
    };

    if (id) {
        // Edit mode
        await updateLeadAPI(id, leadData);
    } else {
        // Add mode
        await addLeadAPI(leadData);
    }

    resetForm();
}

function editLead(id) {
    const lead = leads.find(l => l.id == id || l._id == id);
    if (!lead) return;

    document.getElementById('lead-id').value = lead.id || lead._id;
    document.getElementById('name').value = lead.name;
    document.getElementById('email').value = lead.email;
    document.getElementById('phone').value = lead.phone;
    document.getElementById('source').value = lead.source;
    document.getElementById('status').value = lead.status;
    document.getElementById('notes').value = lead.notes || '';

    formTitle.textContent = 'Edit Lead';
    submitBtn.textContent = 'Update Lead';
    cancelBtn.classList.remove('hidden');
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function confirmDelete(id) {
    leadToDeleteId = id;
    deleteModal.classList.remove('hidden');
}

function resetForm() {
    form.reset();
    document.getElementById('lead-id').value = '';
    formTitle.textContent = 'Add New Lead';
    submitBtn.textContent = 'Save Lead';
    cancelBtn.classList.add('hidden');
}

/**
 * Rendering
 */
function render() {
    updateStats();
    renderTable();
}

function updateStats() {
    const total = leads.length;
    const newLeads = leads.filter(l => l.status === 'New').length;
    const contacted = leads.filter(l => l.status === 'Contacted').length;
    const converted = leads.filter(l => l.status === 'Converted').length;

    statTotal.textContent = total;
    statNew.textContent = newLeads;
    statContacted.textContent = contacted;
    statConverted.textContent = converted;
}

function renderTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterTerm = filterStatus.value;

    let filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm) || 
                              lead.email.toLowerCase().includes(searchTerm);
        const matchesFilter = filterTerm === 'All' || lead.status === filterTerm;
        return matchesSearch && matchesFilter;
    });

    leadsTbody.innerHTML = '';

    if (filteredLeads.length === 0) {
        leadsTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No leads found.</td></tr>`;
        return;
    }

    filteredLeads.forEach(lead => {
        const tr = document.createElement('tr');
        const id = lead.id || lead._id;
        
        let statusClass = '';
        if (lead.status === 'New') statusClass = 'status-new';
        else if (lead.status === 'Contacted') statusClass = 'status-contacted';
        else if (lead.status === 'Converted') statusClass = 'status-converted';

        tr.innerHTML = `
            <td>
                <strong>${lead.name}</strong>
            </td>
            <td class="contact-info">
                <div class="contact-email">✉️ ${lead.email}</div>
                <div class="contact-phone">📞 ${lead.phone}</div>
            </td>
            <td>${lead.source}</td>
            <td>
                <span class="status-badge ${statusClass}">${lead.status}</span>
            </td>
            <td class="notes-cell" title="${lead.notes || ''}">
                ${lead.notes || '-'}
            </td>
            <td class="actions-cell">
                <button class="btn btn-secondary btn-small" onclick="editLead('${id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="confirmDelete('${id}')">Delete</button>
            </td>
        `;
        leadsTbody.appendChild(tr);
    });
}

// Start app
document.addEventListener('DOMContentLoaded', init);
