import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { _faqs } from 'src/_mock';

import { useBoolean } from 'src/hooks/use-boolean';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const FaqSchema = zod.object({
  heading: zod.string().trim().min(1, { message: 'Question is required!' }),
  detail: zod.string().trim().min(1, { message: 'Answer is required!' }),
});

const DEFAULT_VALUES = {
  heading: '',
  detail: '',
};

function AddFaqDialog({ open, onClose, onSubmit }) {
  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(FaqSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES);
    }
  }, [open, reset]);

  const handleFormSubmit = handleSubmit(async (data) => {
    onSubmit(data);
    reset(DEFAULT_VALUES);
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogTitle>Add FAQ</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Field.Text name="heading" label="Question" placeholder="Enter the FAQ question" />

            <Field.Text name="detail" label="Answer" placeholder="Write the answer" multiline rows={5} />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" color="primary" variant="contained" loading={isSubmitting}>
            Add FAQ
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

export function FaqsView() {
  const addDialog = useBoolean();
  const confirmDelete = useBoolean();

  const [faqs, setFaqs] = useState(_faqs);
  const [expanded, setExpanded] = useState(_faqs[0]?.id || false);
  const [faqToDelete, setFaqToDelete] = useState(null);

  const handleAccordionChange = useCallback(
    (panel) => (event, isExpanded) => {
      setExpanded(isExpanded ? panel : false);
    },
    []
  );

  const handleAddFaq = useCallback(
    (data) => {
      const nextId = `faq-${Date.now()}`;

      const newFaq = {
        id: nextId,
        value: `panel${Date.now()}`,
        heading: data.heading.trim(),
        detail: data.detail.trim(),
      };

      setFaqs((prev) => [newFaq, ...prev]);
      setExpanded(nextId);
      addDialog.onFalse();
      toast.success('FAQ added successfully!');
    },
    [addDialog]
  );

  const handleAskDelete = useCallback(
    (faq) => {
      setFaqToDelete(faq);
      confirmDelete.onTrue();
    },
    [confirmDelete]
  );

  const handleCloseDeleteDialog = useCallback(() => {
    confirmDelete.onFalse();
    setFaqToDelete(null);
  }, [confirmDelete]);

  const handleDeleteFaq = useCallback(() => {
    if (!faqToDelete) return;

    setFaqs((prev) => {
      const nextFaqs = prev.filter((item) => item.id !== faqToDelete.id);

      if (expanded === faqToDelete.id) {
        setExpanded(nextFaqs[0]?.id || false);
      }

      return nextFaqs;
    });

    handleCloseDeleteDialog();
    toast.success('FAQ deleted successfully!');
  }, [expanded, faqToDelete, handleCloseDeleteDialog]);

  return (
    <>
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="FAQs"
          links={[{ name: 'Dashboard', href: paths.adminDashboard.root }, { name: 'FAQs' }]}
          action={
            <Button variant="contained" color="primary" startIcon={<Iconify icon="mingcute:add-line" />} onClick={addDialog.onTrue}>
              Add FAQ
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Box>
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Typography variant="h5">Manage frequently asked questions</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Add new entries from the top-right action and remove outdated FAQs directly from the list.
            </Typography>
          </Stack>

          <Stack spacing={2}>
            {faqs.length ? (
              faqs.map((faq, index) => (
                <Accordion key={faq.id} expanded={expanded === faq.id} onChange={handleAccordionChange(faq.id)}>
                  <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ width: 1 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                          FAQ {index + 1}
                        </Typography>
                        <Typography variant="subtitle1">{faq.heading}</Typography>
                      </Box>

                      <IconButton
                        color="error"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAskDelete(faq);
                        }}
                        onFocusCapture={(event) => event.stopPropagation()}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}>
                      {faq.detail}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Stack spacing={1} alignItems="center" justifyContent="center" sx={{ py: 8, borderRadius: 2, bgcolor: 'background.neutral' }}>
                <Iconify icon="solar:question-circle-bold" width={40} sx={{ color: 'text.disabled' }} />
                <Typography variant="subtitle1">No FAQs available</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Create your first FAQ using the Add FAQ button.
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </Box>

      <AddFaqDialog open={addDialog.value} onClose={addDialog.onFalse} onSubmit={handleAddFaq} />

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={handleCloseDeleteDialog}
        title="Delete FAQ"
        content={
          <>
            Are you sure you want to delete <strong>{faqToDelete?.heading}</strong>?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleDeleteFaq}>
            Delete
          </Button>
        }
      />
    </>
  );
}
