import React, { useState, useEffect, useRef } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import yaml from 'js-yaml';
import { attachmentAPI } from '../services/api';
import { useTheme } from 'next-themes';
import Editor from '@monaco-editor/react';

const Swagger: React.FC = () => {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  
  // 1. 왼쪽 에디터의 텍스트를 관리하는 상태
  const [specText, setSpecText] = useState<string>('');
  
  // 2. 파싱된 명세 객체를 관리하는 상태 (Swagger UI에 전달용)
  const [specJson, setSpecJson] = useState<object | null>(null);

  // 3. 파싱 에러 메시지를 관리하는 상태
  const [parseError, setParseError] = useState<string>('');

  // 4. 로딩 상태 관리
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Monaco Editor 설정
  const monacoOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on' as const,
    roundedSelection: false,
    scrollbar: {
      vertical: 'visible' as const,
      horizontal: 'visible' as const,
      verticalScrollbarSize: 12,
      horizontalScrollbarSize: 12,
    },
    automaticLayout: true,
    wordWrap: 'on' as const,
    folding: true,
    foldingStrategy: 'indentation' as const,
    showFoldingControls: 'always' as const,
    selectOnLineNumbers: true,
    contextmenu: true,
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on' as const,
    tabCompletion: 'on' as const,
    wordBasedSuggestions: 'allDocuments' as const,
    parameterHints: {
      enabled: true,
      cycle: true,
    },
    hover: {
      enabled: true,
      delay: 100,
    },
    formatOnPaste: true,
    formatOnType: true,
    autoIndent: 'full' as const,
    matchBrackets: 'always' as const,
    autoClosingBrackets: 'always' as const,
    autoClosingQuotes: 'always' as const,
    autoClosingOvertype: 'always' as const,
    autoSurround: 'quotes' as const,
    bracketPairColorization: {
      enabled: true,
    },
    guides: {
      bracketPairs: true,
      indentation: true,
      highlightActiveIndentation: true,
    },
    renderWhitespace: 'selection' as const,
    renderControlCharacters: false,
    renderLineHighlight: 'all' as const,
    renderValidationDecorations: 'on' as const,
    renderIndentGuides: true,
    renderFinalNewline: 'on' as const,
    renderEndOfLine: 'auto',
  };

  // 컴포넌트가 처음 마운트될 때 attachment 서비스에서 Swagger YAML을 가져옵니다.
  useEffect(() => {
    const fetchSwaggerYaml = async () => {
      setIsLoading(true);
      try {
        const response = await attachmentAPI.getSwaggerYaml();
        if (response && response.yamlContent) {
          setSpecText(response.yamlContent);
        } else {
          setSpecText(`# Swagger YAML 내용이 없습니다.
# YAML 형식의 API 명세를 입력하세요...
# 예시:
openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
  description: API 명세 예시
paths:
  /example:
    get:
      summary: 예시 API
      responses:
        '200':
          description: 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: "Hello World"`);
        }
      } catch (error) {
        console.error('Swagger YAML 조회 실패:', error);
        setSpecText('# Swagger YAML을 불러오는 데 실패했습니다.\n# YAML 형식의 API 명세를 입력하세요...');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSwaggerYaml();
  }, []);

  // 왼쪽 에디터의 텍스트(specText)가 변경될 때마다 실행됩니다.
  useEffect(() => {
    try {
      // YAML(또는 JSON) 텍스트를 JavaScript 객체로 파싱합니다.
      const parsedSpec = yaml.load(specText) as object;
      setSpecJson(parsedSpec); // 파싱 성공 시 오른쪽 UI용 상태 업데이트
      setParseError(''); // 에러 메시지 초기화
    } catch (error) {
      // 파싱 실패 시 (문법 오류 등)
      setSpecJson(null); // 유효하지 않은 명세이므로 UI를 비웁니다.
      if (error instanceof Error) {
        setParseError(`YAML 파싱 오류: ${error.message}`);
      } else {
        setParseError('알 수 없는 파싱 오류가 발생했습니다.');
      }
    }
  }, [specText]);

  // Monaco Editor 변경 핸들러
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setSpecText(value);
    }
  };

  // Monaco Editor 마운트 핸들러
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // 에디터 포커스 시 전체 선택
    editor.onDidFocusEditorText(() => {
      // 포커스 시 특별한 동작이 필요하면 여기에 추가
    });

    // 에디터에 커스텀 명령어 추가 (monaco 참조 제거)
    // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    //   console.log('저장 단축키가 눌렸습니다.');
    // });
  };

  // YAML 새로고침 버튼 클릭 시 호출될 함수
  const handleRefreshYaml = async () => {
    setIsLoading(true);
    try {
      const response = await attachmentAPI.getSwaggerYaml();
      if (response && response.yamlContent) {
        setSpecText(response.yamlContent);
        // Monaco Editor에 값 설정
        if (editorRef.current) {
          editorRef.current.setValue(response.yamlContent);
        }
      }
    } catch (error) {
      console.error('Swagger YAML 새로고침 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 테마에 따른 색상 설정
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#404040' : '#ccc';
  const headerBgColor = isDark ? '#2d2d2d' : '#f8f9fa';

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100%',
      backgroundColor: bgColor,
      color: textColor
    }}>
      {/* 왼쪽: 전문적인 YAML 에디터 (Monaco Editor) */}
      <div style={{ 
        flex: 1, 
        borderRight: `1px solid ${borderColor}`, 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: isDark ? '#1e1e1e' : '#ffffff'
      }}>
        {/* 상단 헤더 */}
        <div style={{ 
          padding: '10px 20px', 
          borderBottom: `1px solid ${borderColor}`, 
          backgroundColor: headerBgColor,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '16px', 
            color: textColor 
          }}>Swagger YAML 편집기</h3>
          <button
            onClick={handleRefreshYaml}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {isLoading ? '로딩 중...' : 'YAML 새로고침'}
          </button>
        </div>
        
        {/* Monaco Editor */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Editor
            height="100%"
            defaultLanguage="yaml"
            value={specText}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={monacoOptions}
            theme={isDark ? 'vs-dark' : 'vs'}
            loading={
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: textColor
              }}>
                에디터를 로딩 중...
              </div>
            }
          />
        </div>
      </div>

      {/* 오른쪽: 실시간 문서 미리보기 (Swagger UI) */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        backgroundColor: bgColor
      }}>
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: `4px solid ${isDark ? '#404040' : '#f3f3f3'}`, 
              borderTop: '4px solid #007bff', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ 
              marginTop: '20px', 
              color: isDark ? '#cccccc' : '#666666' 
            }}>YAML을 불러오는 중...</p>
          </div>
        ) : parseError ? (
          <div style={{ 
            padding: '20px', 
            color: '#ff6b6b',
            backgroundColor: isDark ? '#2a1a1a' : '#fff5f5'
          }}>
            <h3>에러</h3>
            <pre style={{ 
              color: isDark ? '#ff8a8a' : '#d63031',
              backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
              padding: '10px',
              borderRadius: '4px',
              overflow: 'auto'
            }}>{parseError}</pre>
          </div>
        ) : specJson ? (
          <div style={{ height: '100%' }}>
            {React.createElement(SwaggerUI as any, { 
              spec: specJson,
              docExpansion: 'list',
              defaultModelsExpandDepth: 1,
              defaultModelExpandDepth: 1,
              theme: isDark ? 'dark' : 'light'
            })}
          </div>
        ) : (
          <div style={{ 
            padding: '20px',
            color: isDark ? '#cccccc' : '#666666'
          }}>
            <p>유효한 API 명세를 입력해주세요.</p>
          </div>
        )}
      </div>

      {/* CSS 애니메이션 및 스타일 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Monaco Editor 커스텀 스타일 */
        .monaco-editor .margin {
          background-color: ${isDark ? '#252526' : '#f3f3f3'} !important;
        }
        
        .monaco-editor .monaco-editor-background {
          background-color: ${isDark ? '#1e1e1e' : '#ffffff'} !important;
        }
        
        /* Swagger UI 다크모드 스타일 오버라이드 */
        .swagger-ui {
          background-color: ${bgColor} !important;
          color: ${textColor} !important;
        }
        
        /* Swagger UI 제목 및 헤더 개선 */
        .swagger-ui .info .title {
          color: ${textColor} !important;
          font-size: 36px !important;
          font-weight: 300 !important;
        }
        
        .swagger-ui .info .title small {
          color: ${isDark ? '#cccccc' : '#666666'} !important;
        }
        
        .swagger-ui .info .description {
          color: ${textColor} !important;
        }
        
        .swagger-ui .info .description h1,
        .swagger-ui .info .description h2,
        .swagger-ui .info .description h3,
        .swagger-ui .info .description h4,
        .swagger-ui .info .description h5,
        .swagger-ui .info .description h6 {
          color: ${textColor} !important;
        }
        
        .swagger-ui .info .description p {
          color: ${textColor} !important;
        }
        
        .swagger-ui .info .description code {
          background-color: ${isDark ? '#2d2d2d' : '#f0f0f0'} !important;
          color: ${isDark ? '#e0e0e0' : '#333333'} !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
        }
        
        .swagger-ui .info .description pre {
          background-color: ${isDark ? '#2d2d2d' : '#f8f9fa'} !important;
          color: ${textColor} !important;
          border: 1px solid ${borderColor} !important;
          border-radius: 4px !important;
          padding: 10px !important;
        }
        
        .swagger-ui .info .description pre code {
          background-color: transparent !important;
          color: inherit !important;
          padding: 0 !important;
        }
        
        .swagger-ui .info .description ul,
        .swagger-ui .info .description ol {
          color: ${textColor} !important;
        }
        
        .swagger-ui .info .description li {
          color: ${textColor} !important;
        }
        
        .swagger-ui .info .description blockquote {
          border-left: 4px solid ${isDark ? '#007bff' : '#007bff'} !important;
          padding-left: 15px !important;
          margin-left: 0 !important;
          color: ${isDark ? '#cccccc' : '#666666'} !important;
        }
        
        .swagger-ui .info .description table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin: 10px 0 !important;
        }
        
        .swagger-ui .info .description table th,
        .swagger-ui .info .description table td {
          border: 1px solid ${borderColor} !important;
          padding: 8px 12px !important;
          text-align: left !important;
        }
        
        .swagger-ui .info .description table th {
          background-color: ${isDark ? '#2d2d2d' : '#f8f9fa'} !important;
          color: ${textColor} !important;
          font-weight: 600 !important;
        }
        
        .swagger-ui .info .description table td {
          background-color: ${isDark ? '#1a1a1a' : '#ffffff'} !important;
          color: ${textColor} !important;
        }
        
        .swagger-ui .info .description table tr:nth-child(even) td {
          background-color: ${isDark ? '#252525' : '#f9f9f9'} !important;
        }
        
        .swagger-ui .info .description table tr:hover td {
          background-color: ${isDark ? '#2a2a2a' : '#f0f0f0'} !important;
        }
        
        .swagger-ui .info {
          background-color: ${headerBgColor} !important;
          border-color: ${borderColor} !important;
        }
        
        .swagger-ui .scheme-container {
          background-color: ${headerBgColor} !important;
          border-color: ${borderColor} !important;
        }
        
        .swagger-ui .opblock {
          background-color: ${isDark ? '#2d2d2d' : '#f8f9fa'} !important;
          border-color: ${borderColor} !important;
        }
        
        .swagger-ui .opblock .opblock-summary-description {
          color: ${textColor} !important;
        }
        
        .swagger-ui .opblock .opblock-summary-operation-id {
          color: ${textColor} !important;
        }
        
        .swagger-ui .opblock .opblock-summary-path {
          color: ${textColor} !important;
        }
        
        .swagger-ui .opblock .opblock-summary-method {
          color: ${textColor} !important;
        }
        
        .swagger-ui .opblock .opblock-summary {
          border-color: ${borderColor} !important;
        }
        
        .swagger-ui .opblock .opblock-description-wrapper {
          background-color: ${isDark ? '#2a2a2a' : '#ffffff'} !important;
          color: ${textColor} !important;
        }
        
        .swagger-ui .opblock .opblock-description {
          color: ${textColor} !important;
        }
        
        .swagger-ui .opblock .opblock-external-docs-wrapper {
          background-color: ${isDark ? '#2a2a2a' : '#ffffff'} !important;
          color: ${textColor} !important;
        }
        
        .swagger-ui .opblock .opblock-external-docs {
          color: ${textColor} !important;
        }
        
        .swagger-ui .opblock .opblock-parameters {
          background-color: ${isDark ? '#2a2a2a' : '#ffffff'} !important;
          border-color: ${borderColor} !important;
        }
        
        .swagger-ui .opblock .opblock-parameters .parameters-container {
          background-color: ${isDark ? '#2a2a2a' : '#ffffff'} !important;
        }
        
        .swagger-ui .opblock .opblock-parameters .parameters-container .parameter {
          background-color: ${isDark ? '#2a2a2a' : '#ffffff'} !important;
          border-color: ${borderColor} !important;
        }
        
        .swagger-ui .opblock .opblock-parameters .parameters-container .parameter .parameter__name {
          color: ${textColor} !important;
        }
        
        .swagger-ui .opblock .opblock-parameters .parameters-container .parameter .parameter__type {
          color: ${textColor} !important;
        }
        
        .swagger-ui .opblock .opblock-parameters .parameters-container .parameter .parameter__deprecated {
          color: ${isDark ? '#ff8a8a' : '#d63031'} !important;
        }
        
        .swagger-ui .opblock .opblock-parameters .parameters-container .parameter .parameter__required {
          color: ${isDark ? '#ff8a8a' : '#d63031'} !important;
        }
        
        .swagger-ui .opblock .opblock-parameters .parameters-container .parameter .parameter__description {
          color: ${textColor} !important;
        }
        
        .swagger-ui .opblock .opblock-parameters .parameters-container .parameter .parameter__enum {
          color: ${textColor} !important;
        }
        
        .swagger-ui .opblock .opblock-parameters .parameters-container .parameter .parameter__enum-value {
          color: ${textColor} !important;
        }
        
        .swagger-ui .opblock .opblock-parameters .parameters-container .parameter .parameter__enum-value:hover {
          background-color: ${isDark ? '#404040' : '#f0f0f0'} !important;
        }
        
        .swagger-ui .opblock .opblock-parameters .parameters-container .parameter .parameter__enum-value.selected {
          background-color: ${isDark ? '#007bff' : '#007bff'} !important;
          color: white !important;
        }
        
        .swagger-ui .opblock .opblock-parameters .parameters-container .parameter .parameter__enum-value.selected:hover {
          background-color: ${isDark ? '#0056b3' : '#0056b3'} !important;
        }
      `}</style>
    </div>
  );
};

export default Swagger;