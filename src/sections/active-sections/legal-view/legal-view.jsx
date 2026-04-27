import { LoadingButton } from '@mui/lab';
import { Alert, Box, Stack, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import { styled, useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { LoadingScreen } from 'src/components/loading-screen';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(3),
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

/**
 * @param {Object} props
 * @param {string} props.type - Type of legal content (e.g., 'about', 'terms', 'privacy')
 */
export default function LegalView({ type }) {
  const theme = useTheme();
  // const { enqueueSnackbar } = useSnackbar();

  // State for English content
  const [textEn, setTextEn] = useState('');
  const [errorEn, setErrorEn] = useState('');
  const [isUpdatingEn, setIsUpdatingEn] = useState(false);

  // For production: Replace with actual API hooks
  const isLoading = false;
  // const [updateSetting] = useUpdateSettingMutation();
  // const { data, isLoading, refetch } = useGetAdminLegalQuery({ type: type });

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  const quillFormats = ['header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent', 'align', 'link', 'image', 'video'];

  /**
   * Handle English content change
   * @param {string} value - New content value
   */
  const handleChangeEn = (value) => {
    setTextEn(value);
    if (errorEn) setErrorEn('');
  };

  /**
   * Validate content - checks if content is empty or only contains HTML tags
   * @param {string} content - HTML content to validate
   * @returns {boolean} - True if content is valid
   */
  const validateContent = (content) => {
    if (!content) return false;
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    return strippedContent.length > 0;
  };

  /**
   * Handle Save English content
   */
  const handleSaveEnglish = async () => {
    // Validate English content
    if (!validateContent(textEn)) {
      setErrorEn('Please enter English content');
      // enqueueSnackbar('Please enter English content', { variant: 'error' });
      return;
    }

    setIsUpdatingEn(true);

    try {
      const payload = {
        [`${type}_en`]: textEn,
      };

      console.log('Saving English content:', payload);

      // For production: Uncomment and use actual API
      // const response = await updateSetting({ data: payload }).unwrap();
      // enqueueSnackbar('English content updated successfully', { variant: 'success' });
      // refetch(); // Refresh data after update

      // Temporary success simulation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('English content saved successfully');
      // enqueueSnackbar('English content updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error updating English content:', error);
      setErrorEn('Failed to update English content. Please try again.');
      // enqueueSnackbar(error?.data?.message || 'An error occurred while updating English content', { variant: 'error' });
    } finally {
      setIsUpdatingEn(false);
    }
  };

  /**
   * Load data on component mount or type change
   */
  useEffect(() => {
    // For production: Uncomment when API is ready
    // if (data && typeof data === "object") {
    //     setTextEn(data?.[`${type}_en`] ?? "");
    // } else {
    setTextEn('');
    // }

    // Clear errors when type changes
    setErrorEn('');
  }, [type]);

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, display: 'flex', flexDirection: 'column' }}>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Stack spacing={4}>
          <Box>
            <StyledPaper
              elevation={3}
              sx={{
                '.ql-toolbar': {
                  backgroundColor: theme?.palette.mode === 'dark' ? '#fff' : '',
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                },
                '.ql-container': {
                  minHeight: '300px',
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                },
              }}
            >
              <ReactQuill value={textEn} onChange={handleChangeEn} modules={quillModules} formats={quillFormats} placeholder="Enter content here..." theme="snow" />
            </StyledPaper>

            {errorEn && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorEn}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <LoadingButton onClick={handleSaveEnglish} color="primary" variant="contained" loading={isUpdatingEn} disabled={isUpdatingEn}>
                Save {type === 'about' ? 'About Us' : type === 'terms' ? 'Terms' : type === 'policy' ? 'Privacy Policy' : ''}
              </LoadingButton>
            </Box>
          </Box>
        </Stack>
      )}
    </Box>
  );
}
