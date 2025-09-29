import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  ExpandMore,
  Schedule,
  Rule,
  AccessTime
} from '@mui/icons-material';
import type { Form, BusinessHours } from '../../types/form';

interface BusinessRulesEditorProps {
  form: Form;
  onUpdate: (form: Form) => void;
}

const BusinessRulesEditor: React.FC<BusinessRulesEditorProps> = ({ form, onUpdate }) => {
  const [businessHours, setBusinessHours] = useState<BusinessHours>(
    form.config.calendar_settings.business_hours || {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false }
    }
  );

  const [advanceBookingDays, setAdvanceBookingDays] = useState(
    form.config.calendar_settings.advance_booking_days || 30
  );

  const dayLabels = {
    monday: '月曜日',
    tuesday: '火曜日',
    wednesday: '水曜日',
    thursday: '木曜日',
    friday: '金曜日',
    saturday: '土曜日',
    sunday: '日曜日'
  };

  const handleBusinessHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const updatedHours = {
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value
      }
    };
    setBusinessHours(updatedHours);
    
    const updatedForm = {
      ...form,
      config: {
        ...form.config,
        calendar_settings: {
          ...form.config.calendar_settings,
          business_hours: updatedHours
        }
      }
    };
    onUpdate(updatedForm);
  };

  const handleAdvanceBookingDaysChange = (days: number) => {
    setAdvanceBookingDays(days);
    
    const updatedForm = {
      ...form,
      config: {
        ...form.config,
        calendar_settings: {
          ...form.config.calendar_settings,
          advance_booking_days: days
        }
      }
    };
    onUpdate(updatedForm);
  };

  const setAllDays = (template: 'weekday' | 'weekend' | 'closed') => {
    const newHours = { ...businessHours };
    
    switch (template) {
      case 'weekday':
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
          newHours[day] = { open: '09:00', close: '18:00', closed: false };
        });
        break;
      case 'weekend':
        ['saturday', 'sunday'].forEach(day => {
          newHours[day] = { open: '10:00', close: '16:00', closed: false };
        });
        break;
      case 'closed':
        ['sunday'].forEach(day => {
          newHours[day] = { ...newHours[day], closed: true };
        });
        break;
    }
    
    setBusinessHours(newHours);
    
    const updatedForm = {
      ...form,
      config: {
        ...form.config,
        calendar_settings: {
          ...form.config.calendar_settings,
          business_hours: newHours
        }
      }
    };
    onUpdate(updatedForm);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Rule />
        営業時間・ルール設定
      </Typography>

      {/* 営業時間設定 */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule />
            営業時間設定
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 3 }}>
            {/* クイック設定ボタン */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                クイック設定
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setAllDays('weekday')}
                >
                  平日標準 (9:00-18:00)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setAllDays('weekend')}
                >
                  土日設定 (10:00-16:00)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setAllDays('closed')}
                >
                  日曜定休
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 曜日別設定 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(dayLabels).map(([day, label]) => (
                <Box key={day}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle2" sx={{ minWidth: 60 }}>
                          {label}
                        </Typography>
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!businessHours[day]?.closed}
                              onChange={(e) => handleBusinessHoursChange(day, 'closed', !e.target.checked)}
                            />
                          }
                          label="営業"
                        />

                        {!businessHours[day]?.closed && (
                          <>
                            <TextField
                              type="time"
                              label="開店時間"
                              value={businessHours[day]?.open || '09:00'}
                              onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              sx={{ width: 140 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              〜
                            </Typography>
                            <TextField
                              type="time"
                              label="閉店時間"
                              value={businessHours[day]?.close || '18:00'}
                              onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              sx={{ width: 140 }}
                            />
                          </>
                        )}

                        {businessHours[day]?.closed && (
                          <Chip label="定休日" color="default" size="small" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 予約ルール設定 */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime />
            予約ルール設定
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ maxWidth: 300 }}>
              <TextField
                fullWidth
                type="number"
                label="事前予約可能日数"
                value={advanceBookingDays}
                onChange={(e) => handleAdvanceBookingDaysChange(parseInt(e.target.value) || 30)}
                helperText="何日先まで予約を受け付けるか"
                InputProps={{
                  inputProps: { min: 1, max: 365 }
                }}
              />
            </Box>
            
            <Box>
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>
                  現在の設定:
                </Typography>
                <Typography variant="body2">
                  • 事前予約: {advanceBookingDays}日先まで
                </Typography>
              </Alert>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default BusinessRulesEditor;
