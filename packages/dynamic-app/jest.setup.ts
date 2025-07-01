import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

// enable fetchMock and make it the global fetch implementation
fetchMock.enableMocks();
(global as any).fetch = fetchMock;

// Create a <div id="modal-root"> in the test DOM
beforeAll(() => {
  const modalRoot = document.createElement('div');
  modalRoot.setAttribute('id', 'modal-root');
  document.body.appendChild(modalRoot);
});