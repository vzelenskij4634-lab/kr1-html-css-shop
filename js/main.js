// Обе формы работают локально: без отправки и сохранения контактных данных.
const orderForm = document.getElementById('order-form');
const orderDialog = document.getElementById('order-dialog');
const successMessage = document.getElementById('success-message');

if (orderForm && successMessage) {
  const fields = Array.from(orderForm.querySelectorAll('input, select, textarea'));
  const productSelect = orderForm.elements.namedItem('selected-product');
  const summary = document.getElementById('order-form-summary');
  let submitted = false;

  function validateField(field) {
    field.setCustomValidity('');
    if (field.name === 'name' && field.value && field.value.trim().length < 2) {
      field.setCustomValidity('Введите имя: минимум 2 символа, кроме пробелов.');
    }

    const error = document.getElementById(`${field.id}-error`);
    let message = '';
    if (!field.validity.valid) {
      if (field.validity.customError) {
        message = field.validationMessage;
      } else if (field.validity.valueMissing) {
        const missingMessages = {
          name: 'Введите имя.',
          email: 'Введите e-mail.',
          phone: 'Введите телефон.',
          'selected-product': 'Выберите товар.',
          topic: 'Выберите тему заявки.',
          agreement: 'Подтвердите согласие, чтобы проверить заявку.',
        };
        message = missingMessages[field.name] || 'Заполните это поле.';
      } else if (field.validity.typeMismatch) {
        message = 'Введите e-mail в формате name@example.com.';
      } else if (field.validity.patternMismatch) {
        message = 'Введите телефон в формате +7 (900) 000-00-00.';
      } else if (field.validity.tooShort) {
        message = `Введите не менее ${field.minLength} символов.`;
      } else if (field.validity.tooLong) {
        message = `Введите не более ${field.maxLength} символов.`;
      } else {
        message = 'Проверьте значение поля.';
      }
    }

    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
    return !message;
  }

  function updateSummary() {
    const invalid = fields.filter((field) => field.getAttribute('aria-invalid') === 'true');
    summary.hidden = invalid.length === 0;
    summary.textContent = invalid.length
      ? `Заявка не проверена. Исправьте отмеченные поля: ${invalid.length}.`
      : '';
    return invalid;
  }

  function clearErrors() {
    submitted = false;
    fields.forEach((field) => {
      field.setCustomValidity('');
      field.removeAttribute('aria-invalid');
      const error = document.getElementById(`${field.id}-error`);
      if (error) {
        error.textContent = '';
        error.hidden = true;
      }
    });
    updateSummary();
  }

  fields.forEach((field) => {
    const update = () => {
      if (submitted || field.getAttribute('aria-invalid') === 'true') {
        validateField(field);
        updateSummary();
      }
    };
    field.addEventListener('input', update);
    field.addEventListener('change', update);
  });

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitted = true;
    successMessage.hidden = true;
    fields.forEach((field) => {
      if (field.name === 'name' || field.name === 'email') field.value = field.value.trim();
      validateField(field);
    });
    const invalid = updateSummary();
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    const productName = productSelect.selectedOptions[0].textContent;
    orderForm.reset();
    clearErrors();
    if (orderDialog?.open) orderDialog.close();
    successMessage.textContent = `Учебная заявка на «${productName}» проверена. Данные не отправлены и не сохранены.`;
    successMessage.hidden = false;
    successMessage.focus();
  });

  // Включаем кнопку только после подключения обработчика отправки.
  orderForm.noValidate = true;
  orderForm.querySelector('button[type="submit"]').disabled = false;

  const requestedProduct = new URLSearchParams(window.location.search).get('product');
  if (Array.from(productSelect.options).some((option) => option.value === requestedProduct)) {
    productSelect.value = requestedProduct;
  }

  if (orderDialog) {
    document.querySelectorAll('button[data-product]').forEach((button) => {
      button.addEventListener('click', () => {
        orderForm.reset();
        clearErrors();
        successMessage.hidden = true;
        productSelect.value = button.dataset.product;
        orderForm.elements.namedItem('topic').value = 'product';
        orderDialog.showModal();
      });
    });
    document.getElementById('close-order-dialog').addEventListener('click', () => orderDialog.close());
  }
}
