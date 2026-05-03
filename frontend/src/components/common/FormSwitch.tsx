import React from "react";

interface FormSwitchProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

const FormSwitch: React.FC<FormSwitchProps> = ({ label, name, checked, onChange, description }) => {
  return (
    <div 
      className="form-group--switch" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '12px 16px', 
        background: '#f8f9fe', 
        borderRadius: '12px', 
        border: '1px dashed #d5d9eb', 
        marginBottom: '10px',
        gridColumn: '1 / -1'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <label 
          style={{ 
            fontWeight: '600', 
            color: '#2b3674', 
            fontSize: '13px', 
            cursor: 'pointer',
            margin: 0
          }} 
          htmlFor={name}
        >
          {label}
        </label>
        {description && <span style={{ fontSize: '11px', color: '#a3aed0' }}>{description}</span>}
      </div>
      <label 
        className="switch-container" 
        style={{ 
          position: 'relative', 
          display: 'inline-block', 
          width: '44px', 
          height: '22px',
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        <input
          id={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ 
            opacity: 0, 
            width: 0, 
            height: 0, 
            position: 'absolute',
            pointerEvents: 'none'
          }}
        />
        <div 
          className="switch-slider" 
          style={{
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            backgroundColor: checked ? '#4c6ef5' : '#d1d5db', 
            transition: 'background-color 0.3s', 
            borderRadius: '22px',
            boxShadow: checked ? '0 0 8px rgba(76, 110, 245, 0.4)' : 'none'
          }}
        >
          <div 
            style={{
              position: 'absolute', 
              height: '16px', 
              width: '16px', 
              left: checked ? '25px' : '3px', 
              bottom: '3px',
              backgroundColor: 'white', 
              transition: 'left 0.3s', 
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          />
        </div>
      </label>
    </div>
  );
};

export default FormSwitch;
