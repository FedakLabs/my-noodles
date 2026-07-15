import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { AppException } from '../../exceptions';

type DocumentedException = { readonly sample: AppException<unknown> };

export function ApiException(...exceptions: DocumentedException[]) {
  const byStatus = new Map<number, AppException<unknown>[]>();

  for (const { sample } of exceptions) {
    byStatus.set(sample.status, [...(byStatus.get(sample.status) ?? []), sample]);
  }

  return applyDecorators(
    ...[...byStatus].map(([status, samples]) => {
      const [firstSample] = samples;

      return ApiResponse({
        status,
        description: samples.map((sample) => sample.identifier).join(', '),
        content: {
          'application/json': {
            schema:
              samples.length === 1 && firstSample
                ? firstSample.toErrorSchema()
                : { oneOf: samples.map((sample) => sample.toErrorSchema()) },
            examples: Object.fromEntries(
              samples.map((sample) => [
                sample.identifier,
                { summary: sample.message, value: sample.toBody() },
              ]),
            ),
          },
        },
      });
    }),
  );
}
