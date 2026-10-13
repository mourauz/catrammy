document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggle();
  initFormValidation();
  initVoteConfirmation();
  initFlashAutoDismiss();
});


function initPasswordToggle() {
  document.querySelectorAll('.toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.textContent = isHidden ? 'Ocultar' : 'Mostrar';
    });
  });
}

function initFormValidation() {
  const forms = document.querySelectorAll('#login-form, #register-form');

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      let hasError = false;

      form.querySelectorAll('input[required]').forEach((input) => {
        clearFieldError(input);

        if (!input.value.trim()) {
          setFieldError(input, 'Esse campo é obrigatório.');
          hasError = true;
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
          setFieldError(input, 'Digite um email válido.');
          hasError = true;
        } else if (input.type === 'password' && input.minLength > 0 && input.value.length < input.minLength) {
          setFieldError(input, `A senha precisa ter pelo menos ${input.minLength} caracteres.`);
          hasError = true;
        }
      });

      if (hasError) {
        event.preventDefault();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }
    });
  });
}

function setFieldError(input, message) {
  const box = input.closest('.input-box');
  if (!box) return;

  box.classList.add('field-error');

  let msgEl = box.querySelector('.field-error-msg');
  if (!msgEl) {
    msgEl = document.createElement('span');
    msgEl.className = 'field-error-msg';
    box.appendChild(msgEl);
  }
  msgEl.textContent = message;
}

function clearFieldError(input) {
  const box = input.closest('.input-box');
  if (!box) return;

  box.classList.remove('field-error');
  const msgEl = box.querySelector('.field-error-msg');
  if (msgEl) msgEl.remove();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function initVoteConfirmation() {
  document.querySelectorAll('[data-vote-form]').forEach((form) => {
    const label = form.getAttribute('data-confirm-label') || 'opção';
    let chosenButton = null;
    let submitting = false;

    form.querySelectorAll('.vote-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        chosenButton = btn;
      });
    });

    form.addEventListener('submit', (event) => {
    
      if (submitting) {
        event.preventDefault();
        return;
      }

      const choice = chosenButton ? chosenButton.value : null;

      if (!choice) {
        event.preventDefault();
        alert(`Selecione um(a) ${label} antes de votar.`);
        return;
      }

      const confirmed = confirm(`Confirmar voto em "${choice}"?`);
      if (!confirmed) {
        event.preventDefault();
        return;
      }

      submitting = true;

      form.classList.add('is-submitting');
      if (chosenButton) {
        chosenButton.textContent = 'Votando...';
      }
    });
  });
}

function initFlashAutoDismiss() {
  const messages = document.querySelectorAll('.flash-messages li');
  if (!messages.length) return;

  setTimeout(() => {
    messages.forEach((msg) => {
      msg.style.transition = 'opacity 0.4s ease';
      msg.style.opacity = '0';
      setTimeout(() => msg.remove(), 400);
    });
  }, 5000);
}
