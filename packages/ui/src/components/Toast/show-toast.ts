import { type ExternalToast, toast as sonnerToast } from 'sonner';

const defaultToastOptions: ExternalToast = {
  classNames: {
    toast: 'noodles-toast',
  },
};

function withDefaults(options?: ExternalToast): ExternalToast {
  return {
    ...defaultToastOptions,
    ...options,
    classNames: {
      ...defaultToastOptions.classNames,
      ...options?.classNames,
    },
  };
}

type ToastPromiseMessages<T> = {
  loading?: string;
  success?: string | ((data: T) => string);
  error?: string | ((error: unknown) => string);
};

export const showToast = {
  success(message: string, options?: ExternalToast) {
    return sonnerToast.success(message, withDefaults(options));
  },
  error(message: string, options?: ExternalToast) {
    return sonnerToast.error(message, withDefaults(options));
  },
  info(message: string, options?: ExternalToast) {
    return sonnerToast.info(message, withDefaults(options));
  },
  warning(message: string, options?: ExternalToast) {
    return sonnerToast.warning(message, withDefaults(options));
  },
  loading(message: string, options?: ExternalToast) {
    return sonnerToast.loading(message, withDefaults(options));
  },
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: ToastPromiseMessages<T>,
    options?: ExternalToast,
  ) {
    return sonnerToast.promise(promise, {
      ...messages,
      ...withDefaults(options),
    });
  },
  dismiss: sonnerToast.dismiss,
  message(message: string, options?: ExternalToast) {
    return sonnerToast(message, withDefaults(options));
  },
};
