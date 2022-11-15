import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import { ReactComponent as Person } from '../../../assets/images/task/Person.svg';
import styles from '../QuickAssignModal/styles.module.scss';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import Unit from '../../Form/Unit';
import {
  water_valve_flow_rate,
  location_area,
  irrigation_depth,
  percentage_location,
  estimated_duration,
} from '../../../util/convert-units/unit';
import Checkbox from '../../Form/Checkbox';
import { Label } from '../../Typography';
import { useSelector } from 'react-redux';
import { cropLocationsSelector } from '../../../containers/locationSlice';

const TotalWaterUsage = ({ totalWaterUsage }) => {
  const { t } = useTranslation();
  const labelStyle = {
    fontSize: '16px',
    lineHeight: '20px',
    color: 'var(--teal900)',
  };
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
        width: '100%',
        border: `2px solid var(--teal700)`,
        borderRadius: '4px',
        color: 'var(--teal700)',
        marginLeft: 'auto',
      }}
    >
      <Label style={labelStyle}>{t('ADD_TASK.IRRIGATION_VIEW.TOTAL_WATER_USAGE')}</Label>
      <Label style={labelStyle}>{totalWaterUsage} l</Label>
    </div>
  );
};

const WaterUseVolumeCalculator = ({ system, setTotalWaterUsage, totalWaterUsage, formState }) => {
  const { t } = useTranslation();
  const { register, getValues, watch, control, setValue } = formState();
  const { estimated_flow_rate, estimated_irrigation_duration } = getValues();

  useEffect(() => {
    if (estimated_flow_rate && estimated_irrigation_duration) {
      setTotalWaterUsage(() => estimated_flow_rate * estimated_irrigation_duration);
    }
  }, [estimated_irrigation_duration, estimated_flow_rate]);

  const FLOW_RATE = 'estimated_flow_rate';
  const FLOW_RATE_UNIT = 'estimated_flow_rate_unit';
  const DEFAULT_LOCATION_FLOW_RATE = 'default_location_flow_rate';
  const ESTIMATED_DURATION = 'estimated_irrigation_duration';
  const ESTIMATED_DURATION_UNIT = 'estimated_irrigation_duration_unit';

  return (
    <>
      <Unit
        register={register}
        displayUnitName={FLOW_RATE_UNIT}
        label={t('ADD_TASK.IRRIGATION_VIEW.ESTIMATED_FLOW_RATE')}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        name={FLOW_RATE}
        unitType={water_valve_flow_rate}
        max={999999999}
        system={system}
        control={control}
      />

      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.DEFAULT_LOCATION_FLOW_RATE')}
        sm
        style={{ marginTop: '10px', marginBottom: '30px' }}
        hookFormRegister={register(DEFAULT_LOCATION_FLOW_RATE)}
      />

      <Unit
        register={register}
        displayUnitName={ESTIMATED_DURATION_UNIT}
        label={t('ADD_TASK.IRRIGATION_VIEW.ESTIMATED_DURATION')}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        name={ESTIMATED_DURATION}
        unitType={water_valve_flow_rate}
        max={999999999}
        system={system}
        control={control}
        style={{ paddingBottom: '32px' }}
      />

      <TotalWaterUsage totalWaterUsage={totalWaterUsage} />
    </>
  );
};

const WaterUseDepthCalculator = ({ system, setTotalWaterUsage, totalWaterUsage, formState }) => {
  const { t } = useTranslation();
  const { register, getValues, watch, control, setValue } = formState();
  const { location_size, application_depth, percentage_location_irrigated } = getValues();

  const location = useSelector(cropLocationsSelector).filter(
    (location) => location.location_id === getValues().locations[0].location_id,
  );

  const APPLICATION_DEPTH = 'application_depth';
  const APPLICATION_DEPTH_UNIT = 'application_depth_unit';
  const DEFAULT_LOCATION_APPLICATION_DEPTH = 'default_location_application_depth';
  const PERCENTAGE_LOCATION_IRRIGATED = 'percentage_location_irrigated';
  const PERCENTAGE_LOCATION_IRRIGATED_UNIT = 'percentage_location_irrigated_unit';

  const LOCATION_SIZE = 'location_size';
  const LOCATION_SIZE_UNIT = 'location_size_unit';
  const IRRIGATED_AREA = 'irrigated_area';
  const IRRIGATED_AREA_UNIT = 'irrigated_area_unit';

  useEffect(() => {
    if (location_size && percentage_location_irrigated) {
      const irrigatedArea = location_size * application_depth;
      console.log(irrigatedArea);
      setValue(IRRIGATED_AREA, irrigatedArea);
    }
  }, [location_size, percentage_location_irrigated]);

  return (
    <>
      <Unit
        register={register}
        displayUnitName={APPLICATION_DEPTH_UNIT}
        label={t('ADD_TASK.IRRIGATION_VIEW.ESTIMATED_APPLICATION_DEPTH')}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        name={APPLICATION_DEPTH}
        unitType={irrigation_depth}
        max={999999.99}
        system={system}
        control={control}
        disabled={false}
      />

      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.DEFAULT_APPLICATION_DEPTH')}
        sm
        style={{ marginTop: '10px', marginBottom: '30px' }}
        hookFormRegister={register(DEFAULT_LOCATION_APPLICATION_DEPTH)}
      />

      <Unit
        register={register}
        displayUnitName={PERCENTAGE_LOCATION_IRRIGATED_UNIT}
        label={t('ADD_TASK.IRRIGATION_VIEW.PERCENTAGE_LOCATION_TO_BE_IRRIGATED')}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        name={PERCENTAGE_LOCATION_IRRIGATED}
        unitType={percentage_location}
        max={100}
        system={system}
        control={control}
        disabled={false}
      />

      <div
        style={{
          flexDirection: 'row',
          display: 'inline-flex',
          paddingBottom: '40px',
          width: '100%',
          gap: '16px',
          marginTop: '20px',
        }}
      >
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('ADD_TASK.IRRIGATION_VIEW.LOCATION_SIZE')}
          name={LOCATION_SIZE}
          displayUnitName={LOCATION_SIZE_UNIT}
          unitType={location_area}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          value={location[0].total_area}
          disabled={true}
        />

        <Unit
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('ADD_TASK.IRRIGATION_VIEW.IRRIGATED_AREA')}
          name={IRRIGATED_AREA}
          displayUnitName={IRRIGATED_AREA_UNIT}
          unitType={location_area}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={true}
        />
      </div>
      <TotalWaterUsage totalWaterUsage={86969} />
    </>
  );
};

const WaterUseModal = ({
  measurementType,
  system,
  setTotalWaterUsage,
  totalWaterUsage,
  formState,
}) => {
  if (measurementType === 'VOLUME')
    return (
      <WaterUseVolumeCalculator
        system={system}
        totalWaterUsage={totalWaterUsage}
        setTotalWaterUsage={setTotalWaterUsage}
        formState={formState}
      />
    );
  if (measurementType === 'DEPTH')
    return (
      <WaterUseDepthCalculator
        system={system}
        totalWaterUsage={totalWaterUsage}
        setTotalWaterUsage={setTotalWaterUsage}
        formState={formState}
      />
    );
};

export default function WaterUseCalculatorModal({
  dismissModal,
  measurementType,
  system,
  handleModalSubmit,
  totalWaterUsage,
  setTotalWaterUsage,
  formState,
}) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('ADD_TASK.IRRIGATION_VIEW.WATER_USE_CALCULATOR')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} className={styles.button} color="secondary" sm>
            {t('common:CANCEL')}
          </Button>

          <Button className={styles.button} onClick={handleModalSubmit} color="primary" sm>
            {t('common:SAVE')}
          </Button>
        </>
      }
      icon={<Person />}
      tooltipContent={`${t(
        'ADD_TASK.IRRIGATION_VIEW.WATER_USE_CALCULATOR_INFO.PHRASE1',
      )} ${measurementType}. ${t(
        'ADD_TASK.IRRIGATION_VIEW.WATER_USE_CALCULATOR_INFO.PHRASE2',
      )} ${measurementType} ${t('ADD_TASK.IRRIGATION_VIEW.WATER_USE_CALCULATOR_INFO.PHRASE3')}`}
    >
      <WaterUseModal
        system={system}
        measurementType={measurementType}
        totalWaterUsage={totalWaterUsage}
        setTotalWaterUsage={setTotalWaterUsage}
        formState={formState}
      />
    </ModalComponent>
  );
}
WaterUseCalculatorModal.propTypes = {
  dismissModal: PropTypes.func,
  measurementType: PropTypes.string,
};
