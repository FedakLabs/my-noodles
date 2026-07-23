import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';

import { Modal, type ModalRef, useModal } from '../components/Modal';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    docs: {
      description: {
        component:
          'Imperative compound modal. Open/close via ref; compose Header, Body, Footer, and Scrollable.',
      },
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

function BasicDemo() {
  const modalRef = useRef<ModalRef>(null);

  return (
    <>
      <Button variant="contained" onClick={() => modalRef.current?.open()}>
        Open modal
      </Button>
      <Modal ref={modalRef} maxWidth="sm">
        <Modal.Header title="Cancel order" />
        <Modal.Body>
          <Typography variant="body2">Choose a reason, then confirm in the footer.</Typography>
        </Modal.Body>
        <Modal.Footer align="end">
          <Button onClick={() => modalRef.current?.close()}>Back</Button>
          <Button variant="contained" color="error" onClick={() => modalRef.current?.close()}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export const Basic: Story = {
  render: () => <BasicDemo />,
};

function WithBackDemo() {
  const modalRef = useRef<ModalRef>(null);
  const [view, setView] = useState<'list' | 'detail'>('list');

  return (
    <>
      <Button
        variant="contained"
        onClick={() => {
          setView('list');
          modalRef.current?.open();
        }}
      >
        Open modal
      </Button>
      <Modal ref={modalRef} maxWidth="sm">
        {view === 'list' ? (
          <>
            <Modal.Header title="Orders" />
            <Modal.Body>
              <Button onClick={() => setView('detail')}>Open detail</Button>
            </Modal.Body>
            <Modal.Footer align="end">
              <Button onClick={() => modalRef.current?.close()}>Close</Button>
            </Modal.Footer>
          </>
        ) : (
          <>
            <Modal.Header title="Order detail" onBack={() => setView('list')} backLabel="Back" />
            <Modal.Body>
              <Typography variant="body2">Drill-down view with header back control.</Typography>
            </Modal.Body>
            <Modal.Footer align="end">
              <Button onClick={() => setView('list')}>Back</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  );
}

export const WithBack: Story = {
  render: () => <WithBackDemo />,
};

function BodyScrollableDemo() {
  const modalRef = useRef<ModalRef>(null);

  return (
    <>
      <Button variant="contained" onClick={() => modalRef.current?.open()}>
        Open scrollable body
      </Button>
      <Modal ref={modalRef} maxWidth="md">
        <Modal.Header title="Long content" />
        <Modal.Body scrollable>
          <Stack spacing={1}>
            {Array.from({ length: 24 }, (_, index) => (
              <Typography key={index} variant="body2">
                Line {index + 1} — header and footer stay fixed while the body scrolls.
              </Typography>
            ))}
          </Stack>
        </Modal.Body>
        <Modal.Footer align="end">
          <Button onClick={() => modalRef.current?.close()}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export const BodyScrollable: Story = {
  render: () => <BodyScrollableDemo />,
};

function HeaderStickyBodyFooterScrollDemo() {
  const modalRef = useRef<ModalRef>(null);

  return (
    <>
      <Button variant="contained" onClick={() => modalRef.current?.open()}>
        Open body + footer scroll
      </Button>
      <Modal ref={modalRef} maxWidth="md">
        <Modal.Header title="Sticky header" />
        <Modal.Scrollable>
          <Modal.Body>
            <Stack spacing={1}>
              {Array.from({ length: 18 }, (_, index) => (
                <Typography key={index} variant="body2">
                  Section {index + 1} — body and footer scroll together under a fixed header.
                </Typography>
              ))}
            </Stack>
          </Modal.Body>
          <Modal.Footer align="end">
            <Button onClick={() => modalRef.current?.close()}>Done</Button>
          </Modal.Footer>
        </Modal.Scrollable>
      </Modal>
    </>
  );
}

export const HeaderStickyBodyFooterScroll: Story = {
  render: () => <HeaderStickyBodyFooterScrollDemo />,
};

type EditPayload = { orderId: string };

function TypedPayloadInner() {
  const { data, close } = useModal<EditPayload>();

  return (
    <>
      <Modal.Header title="Edit order" />
      <Modal.Body>
        <Typography variant="body2">
          Typed payload from <code>open(data)</code>: {data.orderId}
        </Typography>
      </Modal.Body>
      <Modal.Footer align="end">
        <Button onClick={close}>Close</Button>
      </Modal.Footer>
    </>
  );
}

function TypedPayloadDemo() {
  const modalRef = useRef<ModalRef<EditPayload>>(null);
  const [lastClosed, setLastClosed] = useState<string | null>(null);

  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Button variant="contained" onClick={() => modalRef.current?.open({ orderId: 'ord_demo_123' })}>
        Open with payload
      </Button>
      {lastClosed ? (
        <Typography variant="body2" color="text.secondary">
          Last onClose: {lastClosed}
        </Typography>
      ) : null}
      <Modal
        ref={modalRef}
        maxWidth="sm"
        onClose={() => {
          setLastClosed(new Date().toLocaleTimeString());
        }}
      >
        <TypedPayloadInner />
      </Modal>
    </Stack>
  );
}

export const TypedPayload: Story = {
  render: () => <TypedPayloadDemo />,
};

function DisableCloseDemo() {
  const modalRef = useRef<ModalRef>(null);

  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <Button variant="contained" onClick={() => modalRef.current?.open()}>
        Open modal
      </Button>
      <Modal ref={modalRef} maxWidth="sm">
        <DisableCloseInner />
      </Modal>
    </Stack>
  );
}

function DisableCloseInner() {
  const { close, disableClose, setDisableClose } = useModal();

  return (
    <>
      <Modal.Header title="Saving…" />
      <Modal.Body>
        <Typography variant="body2">
          Children call <code>setDisableClose</code> to lock backdrop / Escape / X during work. Explicit{' '}
          <code>close()</code> still works.
        </Typography>
      </Modal.Body>
      <Modal.Footer align="space-between">
        <Button onClick={() => setDisableClose(!disableClose)}>
          {disableClose ? 'Unlock dismiss' : 'Lock dismiss'}
        </Button>
        <Button variant="contained" onClick={close}>
          Force close
        </Button>
      </Modal.Footer>
    </>
  );
}

export const DisableClose: Story = {
  render: () => <DisableCloseDemo />,
};
