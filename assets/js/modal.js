/**
 * MODAL.JS - Gerenciamento do modal de agendamento
 * Controla abertura, fechamento e interações do modal
 */

const modalLogger = createLogger('Modal');

// Elementos do modal
const modal = document.getElementById('bookingModal');
const interestSelect = document.getElementById('interest');

/**
 * Abre o modal de booking
 * @param {string} treatment - Tratamento pré-selecionado (opcional)
 */
function openBooking(treatment = null) {
  if (!modal) {
    modalLogger.error('Modal não encontrado no DOM');
    return;
  }

  // Se houver tratamento, seleciona
  if (treatment && interestSelect) {
    interestSelect.value = treatment;
  }

  // Abre o modal
  modal.classList.add('open');

  // Focus no primeiro input
  setTimeout(() => {
    const firstInput = modal.querySelector('input:first-of-type');
    if (firstInput) {
      firstInput.focus();
    }
  }, 50);

  // Previne scroll no fundo
  document.body.style.overflow = 'hidden';

  modalLogger.log('Modal aberto');
}

/**
 * Fecha o modal de booking
 */
function closeBooking() {
  if (!modal) return;

  modal.classList.remove('open');
  document.body.style.overflow = '';

  // Reset do formulário
  const form = document.getElementById('bookingForm');
  if (form) {
    form.classList.remove('sent');
  }

  modalLogger.log('Modal fechado');
}

/**
 * Event listener para overlay do modal (clique fora)
 */
if (modal) {
  const overlay = modal.querySelector('.modal__overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeBooking();
    });
  }

  // Close button
  const closeBtn = modal.querySelector('.modal__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeBooking();
    });
  }
}

/**
 * Escape key para fechar modal
 */
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeBooking();
  }
});

/**
 * Previne scroll do body quando modal está aberto
 */
const originalScrollTop = window.scrollY;

function disableBodyScroll() {
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = window.innerWidth - document.documentElement.clientWidth + 'px';
}

function enableBodyScroll() {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

// Update das funções existentes
const originalOpenBooking = openBooking;
const originalCloseBooking = closeBooking;

/**
 * Monitora mudanças no estado do modal
 */
const observerConfig = {
  attributes: true,
  attributeFilter: ['class']
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target === modal) {
      if (modal.classList.contains('open')) {
        disableBodyScroll();
      } else {
        enableBodyScroll();
      }
    }
  });
});

if (modal) {
  observer.observe(modal, observerConfig);
}

/**
 * Acessibilidade - Trap focus dentro do modal
 */
function trapFocus(event) {
  if (!modal || !modal.classList.contains('open')) return;

  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
}

document.addEventListener('keydown', trapFocus);

/**
 * Suporte para mobile - fecha modal ao mudar orientação
 */
window.addEventListener('orientationchange', () => {
  if (modal && modal.classList.contains('open')) {
    // Aguarda a reorientação completar
    setTimeout(() => {
      const dialogHeight = modal.querySelector('.modal__dialog')?.offsetHeight;
      if (dialogHeight && window.innerHeight < dialogHeight) {
        modalLogger.warn('Modal não cabe na viewport após reorientação');
      }
    }, 100);
  }
});

/**
 * Detecção de resize - ensure modal fica visível
 */
const handleResize = debounce(() => {
  if (modal && modal.classList.contains('open')) {
    const dialog = modal.querySelector('.modal__dialog');
    if (dialog) {
      const rect = dialog.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        dialog.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
}, 100);

window.addEventListener('resize', handleResize);

modalLogger.log('Modal controller inicializado');

