/**
 * UTILS.JS - Funções utilitárias e helpers
 * Funções reutilizáveis para todo o projeto
 */

/**
 * Smooth scroll para seções da página
 * @param {string} selector - Seletor CSS do elemento alvo
 * @param {number} offset - Offset em pixels (padrão: 0)
 */
function smoothScroll(selector, offset = 0) {
  const element = document.querySelector(selector);
  if (element) {
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top: top,
      behavior: 'smooth'
    });
  }
}

/**
 * Verifica se um elemento está visível no viewport
 * @param {HTMLElement} element - Elemento a verificar
 * @returns {boolean} True se visível
 */
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Debounce para funções que são chamadas frequentemente
 * @param {Function} func - Função a debounce
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função debounced
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle para limitar a frequência de execução
 * @param {Function} func - Função a throttle
 * @param {number} limit - Tempo limite em ms
 * @returns {Function} Função throttled
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Formata número de telefone (BR)
 * @param {string} phone - Número de telefone
 * @returns {string} Telefone formatado
 */
function formatPhoneBR(phone) {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  
  if (!match) return phone;
  
  const [, area, firstPart, secondPart] = match;
  
  if (!area) return firstPart;
  if (!secondPart) return `(${area}) ${firstPart}`;
  
  return `(${area}) ${firstPart}-${secondPart}`;
}

/**
 * Valida email
 * @param {string} email - Email a validar
 * @returns {boolean} True se válido
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida telefone brasileiro
 * @param {string} phone - Telefone a validar
 * @returns {boolean} True se válido (10 ou 11 dígitos)
 */
function isValidPhoneBR(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}

/**
 * Cria delay/sleep
 * @param {number} ms - Millisegundos
 * @returns {Promise} Promise que resolve após delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Copia texto para clipboard
 * @param {string} text - Texto a copiar
 * @returns {Promise} Promise que resolve quando copiado
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback para browsers antigos
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  } catch (err) {
    console.error('Erro ao copiar para clipboard:', err);
  }
}

/**
 * Obter valor de query parameter
 * @param {string} param - Nome do parâmetro
 * @returns {string|null} Valor do parâmetro ou null
 */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Rola a página para o topo
 * @param {boolean} smooth - Se deve usar smooth scroll
 */
function scrollToTop(smooth = true) {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
}

/**
 * Detecta suporte a recursos
 */
const FeatureDetection = {
  // Suporte a localStorage
  hasLocalStorage() {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Suporte a sessionStorage
  hasSessionStorage() {
    try {
      const test = '__test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Suporte a IntersectionObserver
  hasIntersectionObserver() {
    return 'IntersectionObserver' in window;
  },

  // Suporte a Clipboard API
  hasClipboardAPI() {
    return 'clipboard' in navigator;
  },

  // Suporte a geolocation
  hasGeolocation() {
    return 'geolocation' in navigator;
  },

  // Verifica se é mobile
  isMobile() {
    return window.matchMedia('(max-width: 760px)').matches;
  },

  // Verifica conexão
  isOnline() {
    return navigator.onLine;
  }
};

/**
 * Logger com namespace
 * @param {string} namespace - Nome do namespace
 * @returns {Object} Objeto com métodos log, warn, error, info
 */
function createLogger(namespace) {
  const prefix = `[${namespace}]`;
  return {
    log: (...args) => console.log(prefix, ...args),
    warn: (...args) => console.warn(prefix, ...args),
    error: (...args) => console.error(prefix, ...args),
    info: (...args) => console.info(prefix, ...args),
  };
}

// Logger da aplicação
const logger = createLogger('GM');

/**
 * Inicializa event listeners quando DOM está pronto
 */
document.addEventListener('DOMContentLoaded', () => {
  logger.log('Aplicação iniciada');
});

/**
 * Cleanup ao descarregar página
 */
window.addEventListener('beforeunload', () => {
  logger.log('Página será descarregada');
});

