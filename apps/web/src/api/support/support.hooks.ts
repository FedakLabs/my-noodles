'use client';

import { formatUseMutation } from '@my-noodles/web-lib/react-query';
import { useMutation } from '@tanstack/react-query';

import { supportMutations } from './support';

export function useOpenSupportSession() {
  return formatUseMutation(useMutation(supportMutations.openSession()), 'openSupportSession');
}
