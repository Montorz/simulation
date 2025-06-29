export default function ControlsPanel({
  params,         // Текущие параметры симуляции
  onParamsChange, // Функция изменения параметров
  onReset,        // Функция сброса симуляции
  showVision,     // Флаг показа радиусов зрения
  setShowVision,  // Функция изменения флага радиусов
  stats           // Статистика симуляции
}) {
  return (
    <div className="controls">
      {/* Блок статистики */}
      <div className="stats">
        <h3>Статистика</h3>
        <p>Хищников: <span>{stats.predators}</span></p>
        <p>Жертв: <span>{stats.prey}</span></p>
        <p>Ядовитых жертв: <span>{stats.poisoned}</span></p>
        <p>Травы: <span>{stats.food}/{params.foodCount}</span></p>
      </div>

      {/* Блок управления */}
      <div className="control-group">
        <h3>Управление</h3>
        {/* Кнопка сброса */}
        <button onClick={onReset}>Сбросить</button>
        {/* Переключатель показа радиусов */}
        <label className="toggle-vision">
          <input
            type="checkbox"
            checked={showVision}
            onChange={() => setShowVision(!showVision)}
          />
          Радиус зрения
        </label>
      </div>

      {/* Блок параметров хищников */}
      <div className="control-group">
        <h3>Хищники</h3>
        {/* Количество хищников */}
        <label>
          Количество: {params.predatorCount}
          <input
            type="range"
            min="1"
            max="20"
            value={params.predatorCount}
            onChange={(e) => onParamsChange({ ...params, predatorCount: +e.target.value })}
          />
        </label>
        {/* Скорости хищников */}
        <label>
          Скорость: {params.predatorSpeed.toFixed(1)}
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={params.predatorSpeed}
            onChange={(e) => onParamsChange({ ...params, predatorSpeed: +e.target.value })}
          />
        </label>
        {/* Радиус зрения хищников */}
        <label>
          Радиус зрения: {params.predatorVisionRadius}
          <input
            type="range"
            min="50"
            max="300"
            value={params.predatorVisionRadius}
            onChange={(e) => onParamsChange({ ...params, predatorVisionRadius: +e.target.value })}
          />
        </label>
        {/* Порог размножения хищников */}
        <label>
          Для размножения: {params.predatorReproductionThreshold}
          <input
            type="range"
            min="1"
            max="5"
            value={params.predatorReproductionThreshold}
            onChange={(e) => onParamsChange({ ...params, predatorReproductionThreshold: +e.target.value })}
          />
        </label>
      </div>

      {/* Блок параметров жертв */}
      <div className="control-group">
        <h3>Жертвы</h3>
        {/* Количество жертв */}
        <label>
          Количество: {params.preyCount}
          <input
            type="range"
            min="10"
            max="100"
            value={params.preyCount}
            onChange={(e) => onParamsChange({ ...params, preyCount: +e.target.value })}
          />
        </label>
        {/* Скорости жертв */}
        <label>
          Скорость: {params.preySpeed.toFixed(1)}
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={params.preySpeed}
            onChange={(e) => onParamsChange({ ...params, preySpeed: +e.target.value })}
          />
        </label>
        {/* Радиус зрения жертв */}
        <label>
          Радиус зрения: {params.preyVisionRadius}
          <input
            type="range"
            min="50"
            max="300"
            value={params.preyVisionRadius}
            onChange={(e) => onParamsChange({ ...params, preyVisionRadius: +e.target.value })}
          />
        </label>
        {/* Порог размножения жертв */}
        <label>
          Для размножения: {params.preyReproductionThreshold}
          <input
            type="range"
            min="1"
            max="8"
            value={params.preyReproductionThreshold}
            onChange={(e) => onParamsChange({ ...params, preyReproductionThreshold: +e.target.value })}
          />
        </label>
      </div>

      {/* Блок параметров окружения */}
      <div className="control-group">
        <h3>Окружение</h3>
        {/* Количество травы */}
        <label>
          Трава: {params.foodCount}
          <input
            type="range"
            min="50"
            max="300"
            value={params.foodCount}
            onChange={(e) => onParamsChange({ ...params, foodCount: +e.target.value })}
          />
        </label>
        {/* Шанс ядовитой травы */}
        <label>
          Шанс яда: {(params.poisonChance * 100).toFixed(0)}%
          <input
            type="range"
            min="0"
            max="5"
            value={params.poisonChance * 100}
            onChange={(e) => onParamsChange({ ...params, poisonChance: +e.target.value / 100 })}
          />
        </label>
        {/* Время восстановления травы */}
        <label>
          Восстановление: {params.recoveryTimeSeconds} сек
          <input
            type="range"
            min="5"
            max="60"
            value={params.recoveryTimeSeconds}
            onChange={(e) => onParamsChange({ ...params, recoveryTimeSeconds: +e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}