"use client";

import Link from "next/link";

export default function App() {
  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        color: '#333'
      }}>
        Fermion - Video Streaming Platform
      </h1>
      
      <p style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        fontSize: '18px',
        color: '#666'
      }}>
        Real-time video streaming powered by WebRTC and MediaSoup
      </p>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        
        <div style={{
          border: '2px solid #007bff',
          borderRadius: '12px',
          padding: '30px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          transition: 'transform 0.2s',
        }}>
          <h2 style={{ color: '#007bff', marginBottom: '15px' }}>
             Start Streaming
          </h2>
          <p style={{ 
            marginBottom: '20px',
            color: '#666',
            lineHeight: '1.5'
          }}>
            Share your camera and microphone with others. 
            Start broadcasting your video stream to connected viewers.
          </p>
          <Link 
            href="/stream"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
          >
            Start Streaming
          </Link>
        </div>

        <div style={{
          border: '2px solid #28a745',
          borderRadius: '12px',
          padding: '30px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          transition: 'transform 0.2s',
        }}>
          <h2 style={{ color: '#28a745', marginBottom: '15px' }}>
            Watch Streams
          </h2>
          <p style={{ 
            marginBottom: '20px',
            color: '#666',
            lineHeight: '1.5'
          }}>
            View live video streams from other users. 
            Connect and watch multiple streams simultaneously.
          </p>
          <Link 
            href="/watch"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
          >
            Watch Streams
          </Link>
        </div>
      </div>
    </div>
  );
}
