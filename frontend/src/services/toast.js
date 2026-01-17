/**
 * BYD KDS - Toast Notification System
 * Professional toast notifications for the application
 */

const Toast = {
    container: null,

    // Initialize toast container
    init() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.innerHTML = '';
        document.body.appendChild(this.container);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #toast-container {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            }

            .toast {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px 20px;
                min-width: 320px;
                max-width: 420px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
                color: #fff;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                pointer-events: auto;
                transform: translateX(120%);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }

            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }

            .toast.hiding {
                transform: translateX(120%);
                opacity: 0;
            }

            .toast-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                font-size: 12px;
            }

            .toast.success .toast-icon {
                background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            }

            .toast.error .toast-icon {
                background: linear-gradient(135deg, #fc8181 0%, #e53e3e 100%);
            }

            .toast.warning .toast-icon {
                background: linear-gradient(135deg, #f6e05e 0%, #ecc94b 100%);
                color: #1a1a2e;
            }

            .toast.info .toast-icon {
                background: linear-gradient(135deg, #63b3ed 0%, #4299e1 100%);
            }

            .toast-content {
                flex: 1;
            }

            .toast-title {
                font-weight: 600;
                margin-bottom: 4px;
            }

            .toast-message {
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.4;
            }

            .toast-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                cursor: pointer;
                padding: 4px;
                font-size: 14px;
                transition: color 0.2s;
            }

            .toast-close:hover {
                color: #fff;
            }

            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 0 0 12px 12px;
                animation: toast-progress linear forwards;
            }

            .toast.success .toast-progress {
                background: #48bb78;
            }

            .toast.error .toast-progress {
                background: #e53e3e;
            }

            .toast.warning .toast-progress {
                background: #ecc94b;
            }

            .toast.info .toast-progress {
                background: #4299e1;
            }

            @keyframes toast-progress {
                from { width: 100%; }
                to { width: 0%; }
            }

            @media (max-width: 480px) {
                #toast-container {
                    top: 16px;
                    right: 16px;
                    left: 16px;
                }
                .toast {
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    },

    // Show toast
    show(options) {
        this.init();

        const {
            type = 'info',
            title = '',
            message = '',
            duration = 4000
        } = typeof options === 'string' ? { message: options } : options;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '!',
            info: 'i'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="toast-progress" style="animation-duration: ${duration}ms"></div>
        `;

        this.container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto remove
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 400);
        }, duration);

        return toast;
    },

    // Convenience methods
    success(message, title = 'Başarılı') {
        return this.show({ type: 'success', title, message });
    },

    error(message, title = 'Hata') {
        return this.show({ type: 'error', title, message, duration: 6000 });
    },

    warning(message, title = 'Uyarı') {
        return this.show({ type: 'warning', title, message });
    },

    info(message, title = 'Bilgi') {
        return this.show({ type: 'info', title, message });
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Toast.init());
} else {
    Toast.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Toast;
}
