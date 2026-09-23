/**
 * FORM.JS - Gerenciamento do formulário de booking
 * Validação, formatação e submissão
 */

const formLogger = createLogger('Form');

// Elementos do formulário
const bookingForm = document.getElementById('bookingForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const interestInput = document.getElementById('interest');
const timeInput = document.getElementById('time');

// Configuração
const WHATSAPP_NUMBER = '5521984249995';
const FORM_CONFIG = {
  nameMinLength: 2,
  phoneMinLength: 10
};

/**
 * Valida o formulário
 * @returns {Object} Objeto com validação e mensagens de erro
 */
function validateForm() {
  const errors = {};
  const name = nameInput?.value?.trim() || '';
  const phone = phoneInput?.value?.replace(/\D/g, '') || '';

  // Validação do nome
  if (!name || name.length < FORM_CONFIG.nameMinLength) {
    errors.name = 'Nome deve ter no mínimo 2 caracteres';
  }

  // Validação do telefone
  if (!phone || phone.length < FORM_CONFIG.phoneMinLength) {
    errors.phone = 'Telefone inválido (mínimo 10 dígitos)';
  }

  if (!isValidPhoneBR(phone)) {
    errors.phone = 'Telefone brasileiro inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Mostra erros no formulário
 * @param {Object} errors - Objeto com erros por campo
 */
function showFormErrors(errors) {
  // Remove erros anteriores
  document.querySelectorAll('.form-error').forEach(el => el.remove());

  Object.keys(errors).forEach(fieldName => {
    const field = document.getElementById(fieldName);
    if (field) {
      const errorMsg = document.createElement('p');
      errorMsg.className = 'form-error';
      errorMsg.textContent = errors[fieldName];
      errorMsg.style.color = '#c1121f';
      errorMsg.style.fontSize = '12px';
      errorMsg.style.marginTop = '4px';
      field.after(errorMsg);
      
      // Adiciona classe de erro ao input
      field.style.borderColor = '#c1121f';
    }
  });
}

/**
 * Remove estilos de erro dos inputs
 */
function clearFormErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.remove());
  document.querySelectorAll('.form-input').forEach(el => {
    el.style.borderColor = '';
  });
}

/**
 * Formata o input de telefone em tempo real
 */
if (phoneInput) {
  phoneInput.addEventListener('input', (e) => {
    e.target.value = formatPhoneBR(e.target.value);
    clearFormErrors();
  });

  // Limpar erro ao focar
  phoneInput.addEventListener('focus', () => {
    phoneInput.style.borderColor = '';
  });
}

/**
 * Limpar erros ao focar em qualquer input
 */
document.querySelectorAll('.form-input').forEach(input => {
  input.addEventListener('focus', () => {
    clearFormErrors();
  });
});

/**
 * Constrói mensagem para WhatsApp
 * @returns {string} Mensagem formatada
 */
function buildWhatsAppMessage() {
  const name = nameInput?.value?.trim() || '';
  const phone = phoneInput?.value?.trim() || '';
  const interest = interestInput?.value || '';
  const time = timeInput?.value || '';

  const message = `Olá! Acabei de solicitar uma avaliação pelo site da Dra. Goreti Magalhães.

Nome: ${name}
Telefone: ${phone}
Interesse: ${interest}
Melhor período: ${time}`;

  return message;
}

/**
 * Redireciona para WhatsApp
 * @param {string} message - Mensagem a enviar
 */
function redirectToWhatsApp(message) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  
  formLogger.log('Redirecionando para WhatsApp');
  
  // Usa window.location para maior compatibilidade
  window.location.href = whatsappUrl;
}

/**
 * Submissão do formulário
 */
if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    formLogger.log('Formulário submetido');

    // Limpa erros anteriores
    clearFormErrors();

    // Valida
    const validation = validateForm();
    if (!validation.isValid) {
      formLogger.warn('Erros encontrados:', validation.errors);
      showFormErrors(validation.errors);
      return;
    }

    // Marca como enviado
    bookingForm.classList.add('sent');
    formLogger.log('Formulário marcado como enviado');

    // Aguarda um pouco para melhor UX
    await sleep(500);

    // Constrói e envia mensagem
    const message = buildWhatsAppMessage();
    redirectToWhatsApp(message);
  });
}

/**
 * Placeholder text para melhor UX
 */
if (nameInput) {
  nameInput.placeholder = 'Como podemos chamar você?';
  nameInput.setAttribute('autocomplete', 'name');
}

if (phoneInput) {
  phoneInput.placeholder = '(00) 00000-0000';
  phoneInput.setAttribute('autocomplete', 'tel');
}

/**
 * Reset do formulário ao fechar modal
 */
function resetBookingForm() {
  if (bookingForm) {
    bookingForm.reset();
    bookingForm.classList.remove('sent');
    clearFormErrors();
  }
}

// Sobrescreve função de closeBooking para também resetar o form
const originalClose = closeBooking;
globalThis.closeBooking = function() {
  originalClose();
  resetBookingForm();
};

/**
 * Local Storage - Salva dados já preenchidos (opcional)
 */
const STORAGE_KEY = 'gm-booking-form';

function saveFormData() {
  if (!FeatureDetection.hasLocalStorage()) return;

  const data = {
    name: nameInput?.value || '',
    phone: phoneInput?.value || '',
    timestamp: Date.now()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    formLogger.log('Dados salvos localmente');
  } catch (e) {
    formLogger.warn('Não foi possível salvar dados:', e);
  }
}

function loadFormData() {
  if (!FeatureDetection.hasLocalStorage()) return;

  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data && data.timestamp) {
      // Apenas carrega dados com menos de 7 dias
      const daysSince = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        if (nameInput && data.name) nameInput.value = data.name;
        if (phoneInput && data.phone) phoneInput.value = data.phone;
        formLogger.log('Dados carregados do local storage');
      }
    }
  } catch (e) {
    formLogger.warn('Erro ao carregar dados:', e);
  }
}

// Carrega dados ao abrir modal
const originalOpen = openBooking;
globalThis.openBooking = function(treatment) {
  loadFormData();
  originalOpen(treatment);
};

// Salva dados ao mudar inputs
if (nameInput) {
  nameInput.addEventListener('blur', saveFormData);
}
if (phoneInput) {
  phoneInput.addEventListener('blur', saveFormData);
}

/**
 * Analytics - Rastreamento de eventos (opcional)
 */
function trackEvent(eventName, eventData = {}) {
  if (typeof window.gtag !== 'undefined') {
    gtag('event', eventName, eventData);
    formLogger.log('Evento rastreado:', eventName);
  }
}

// Rastreia abertura do modal
const originalOpenAnalytics = openBooking;
globalThis.openBooking = function(treatment) {
  trackEvent('booking_modal_open', { treatment: treatment || 'none' });
  originalOpenAnalytics(treatment);
};

// Rastreia submissão do formulário
const originalSubmit = bookingForm?.onsubmit;
if (bookingForm) {
  bookingForm.addEventListener('submit', () => {
    trackEvent('booking_form_submit', {
      interest: interestInput?.value,
      period: timeInput?.value
    });
  });
}

formLogger.log('Form controller inicializado');

