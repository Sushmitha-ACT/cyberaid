import { ImageResponse } from 'next/og';
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#3b82f6', // blue-500
          borderRadius: '20%', // slightly rounded
          border: '2px solid #3b82f6',
        }}
      >
        🛡️
      </div>
    ),
    {
      ...size,
    }
  );
}
