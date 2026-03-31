import type { ToolContentData } from "./tool-content";

export const imageFileToolContent: Record<string, ToolContentData> = {
  /* ───────────────────────── IMAGE TOOLS ───────────────────────── */

  "image-cropper": {
    about: {
      en: "Image Cropper lets you trim any part of your image with pixel-perfect precision. Choose a free-form crop, lock to a fixed aspect ratio, or pick a ready-made preset for Instagram, Facebook, YouTube thumbnails, and more — ideal for designers, social-media managers, and anyone preparing images for the web.",
      ko: "이미지 자르기 도구는 자유 비율, 고정 비율, SNS 프리셋(인스타그램, 페이스북, 유튜브 썸네일 등)을 지원하여 원하는 영역을 정밀하게 잘라냅니다. 디자이너, 마케터, 블로거 등 웹용 이미지를 준비하는 모든 분에게 적합합니다.",
    },
    howItWorks: {
      en: "When you upload an image, it is rendered onto an HTML5 Canvas element entirely within your browser. The cropping region you select is translated into pixel coordinates, and the Canvas API's drawImage() method extracts exactly that rectangle into a new canvas. The result is then exported as a PNG or JPEG blob using toBlob(). Because all processing happens client-side via the Canvas API, your image files never leave your device — no server upload, no third-party access, complete privacy guaranteed.",
      ko: "이미지를 업로드하면 브라우저 내부의 HTML5 Canvas 요소에 렌더링됩니다. 선택한 자르기 영역은 픽셀 좌표로 변환되고, Canvas API의 drawImage() 메서드가 해당 영역만 새 캔버스에 추출합니다. 결과물은 toBlob()을 통해 PNG 또는 JPEG로 내보내집니다.\n\n모든 처리가 Canvas API를 사용하여 브라우저에서 클라이언트 측으로 이루어지므로, 이미지 파일이 기기 밖으로 전송되지 않습니다. 서버 업로드도, 제3자 접근도 없으며, 완벽한 개인정보 보호가 보장됩니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "image-resizer": {
    about: {
      en: "Image Resizer changes the dimensions of your images by specifying exact pixel values or a percentage scale. It supports batch processing and maintains aspect ratio by default, making it perfect for web developers, bloggers, and e-commerce sellers who need consistently sized product images.",
      ko: "이미지 크기 조절 도구는 픽셀(px) 값이나 비율(%)을 지정하여 이미지 크기를 변경합니다. 기본적으로 종횡비를 유지하며, 웹 개발자, 블로거, 쇼핑몰 운영자 등 일정한 크기의 이미지가 필요한 분들에게 최적입니다.",
    },
    howItWorks: {
      en: "Your image is loaded into an off-screen Canvas element in the browser. The Canvas API resizes the image by drawing it at the target dimensions using drawImage() with bicubic-quality interpolation provided by the browser's rendering engine. You can enter exact pixel dimensions or a percentage, and the tool automatically calculates the other axis when the aspect-ratio lock is enabled.\n\nAll computation runs client-side through the HTML5 Canvas API. Your files are never uploaded to any server, ensuring complete privacy and instant results regardless of your internet speed.",
      ko: "이미지는 브라우저 내부의 오프스크린 Canvas 요소에 로드됩니다. Canvas API가 브라우저 렌더링 엔진의 고품질 보간법을 적용하여 drawImage()로 목표 크기에 맞춰 이미지를 다시 그립니다. 픽셀 값 또는 비율을 입력하면, 종횡비 잠금 활성화 시 나머지 축이 자동으로 계산됩니다.\n\n모든 연산은 HTML5 Canvas API를 통해 클라이언트 측에서 실행됩니다. 파일이 서버에 업로드되지 않으므로 완벽한 개인정보 보호와 인터넷 속도에 관계없는 즉각적인 결과를 보장합니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "image-compressor": {
    about: {
      en: "Image Compressor reduces the file size of your JPEG, PNG, and WebP images by adjusting the compression quality level. Drag the quality slider to find the perfect balance between file size and visual fidelity — essential for speeding up websites, meeting email attachment limits, and saving storage space.",
      ko: "이미지 압축 도구는 JPEG, PNG, WebP 이미지의 압축 품질을 조절하여 파일 크기를 줄입니다. 품질 슬라이더를 움직여 파일 크기와 화질 사이의 최적 균형을 찾을 수 있으며, 웹사이트 속도 개선, 이메일 첨부 용량 제한 충족, 저장 공간 절약에 필수적입니다.",
    },
    howItWorks: {
      en: "After you drop an image into the tool, it is decoded and drawn onto an HTML5 Canvas. The Canvas API's toBlob() method is then called with an adjustable quality parameter (0 to 1 for JPEG/WebP) to re-encode the image at the desired compression level. For PNG files, a quantization algorithm reduces the color palette to achieve smaller file sizes. A real-time preview and file-size comparison let you fine-tune the result before downloading.\n\nAll encoding and decoding happens inside your browser using the Canvas API and JavaScript — your images never leave your device, so your files remain completely private.",
      ko: "이미지를 업로드하면 HTML5 Canvas에 디코딩 및 렌더링됩니다. Canvas API의 toBlob() 메서드가 조절 가능한 품질 매개변수(JPEG/WebP의 경우 0~1)로 호출되어 원하는 압축 수준으로 이미지를 재인코딩합니다. PNG 파일의 경우 양자화 알고리즘이 색상 팔레트를 줄여 파일 크기를 줄입니다. 실시간 미리보기와 파일 크기 비교로 다운로드 전 결과를 세밀하게 조정할 수 있습니다.\n\n모든 인코딩과 디코딩은 Canvas API와 JavaScript를 사용하여 브라우저 내부에서 이루어지므로, 이미지가 기기 밖으로 나가지 않아 파일의 완벽한 개인정보 보호가 보장됩니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "image-kb-resizer": {
    about: {
      en: "Image KB Resizer shrinks your image to a specific target file size in kilobytes. Simply enter the desired KB limit — the tool automatically adjusts quality and dimensions to hit that target. Perfect for passport photos, online applications, forum avatars, and any upload form with a strict size cap.",
      ko: "이미지 용량 줄이기 도구는 목표 파일 크기(KB)를 지정하면 자동으로 품질과 크기를 조절하여 해당 용량에 맞춥니다. 증명사진, 온라인 원서 접수, 포럼 아바타 등 엄격한 용량 제한이 있는 업로드에 완벽합니다.",
    },
    howItWorks: {
      en: "The tool uses an iterative binary-search algorithm on the HTML5 Canvas API's toBlob() quality parameter to converge on your target file size. It starts by encoding the image at medium quality, checks the resulting blob size, and adjusts the quality up or down accordingly. If quality reduction alone isn't sufficient, the image dimensions are also scaled down proportionally. The loop typically converges within 5–8 iterations, delivering a result that is at or just below the specified KB limit.\n\nEvery step — decoding, resizing, and re-encoding — runs entirely in your browser via the Canvas API. No image data is ever sent to a server, guaranteeing full privacy.",
      ko: "이 도구는 HTML5 Canvas API의 toBlob() 품질 매개변수에 이진 탐색 알고리즘을 적용하여 목표 파일 크기에 수렴합니다. 중간 품질로 인코딩한 후 결과 blob 크기를 확인하고, 그에 따라 품질을 올리거나 내립니다. 품질 감소만으로 부족하면 이미지 크기도 비례적으로 축소합니다. 보통 5~8회 반복으로 지정된 KB 제한 이하의 결과를 도출합니다.\n\n디코딩, 리사이징, 재인코딩 등 모든 과정이 Canvas API를 통해 브라우저에서만 실행됩니다. 이미지 데이터가 서버로 전송되지 않아 완벽한 개인정보 보호가 보장됩니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "image-upscaler": {
    about: {
      en: "Image Upscaler enlarges your low-resolution images to 2x or 4x their original size while preserving sharpness and detail. Using advanced interpolation techniques running entirely in your browser, it is ideal for enhancing old photos, upscaling icons, and preparing small images for print.",
      ko: "이미지 해상도 높이기 도구는 저해상도 이미지를 2배 또는 4배로 확대하면서 선명도와 디테일을 유지합니다. 브라우저에서 실행되는 고급 보간 기법을 활용하며, 오래된 사진 보정, 아이콘 확대, 인쇄용 이미지 준비에 이상적입니다.",
    },
    howItWorks: {
      en: "The uploaded image is drawn onto a large HTML5 Canvas at the selected scale (2x or 4x). The browser's built-in rendering pipeline applies high-quality bicubic interpolation during the drawImage() upscale. An optional sharpening pass using a convolution filter on the Canvas pixel data (via getImageData/putImageData) enhances edges and reduces the soft look typical of simple interpolation. The final result is exported as a PNG or JPEG blob.\n\nAll image processing is performed client-side using the Canvas API and typed-array pixel manipulation. Your images never leave the browser — zero server contact, zero privacy risk.",
      ko: "업로드된 이미지는 선택한 배율(2x 또는 4x)로 큰 HTML5 Canvas에 그려집니다. 브라우저의 내장 렌더링 파이프라인이 drawImage() 확대 시 고품질 바이큐빅 보간법을 적용합니다. 선택적 선명화 과정에서 Canvas 픽셀 데이터(getImageData/putImageData)에 컨볼루션 필터를 적용하여 단순 보간에서 발생하는 흐릿함을 줄이고 가장자리를 선명하게 합니다. 최종 결과는 PNG 또는 JPEG blob으로 내보내집니다.\n\n모든 이미지 처리가 Canvas API와 타입드 배열 픽셀 조작을 사용하여 클라이언트 측에서 수행됩니다. 이미지가 브라우저 밖으로 나가지 않아 서버 접촉도, 개인정보 위험도 전혀 없습니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "image-watermark": {
    about: {
      en: "Image Watermark overlays custom text or a logo image onto your photos to protect your work and assert ownership. Adjust opacity, position, size, rotation, and tiling to create subtle or bold watermarks — essential for photographers, artists, and content creators sharing work online.",
      ko: "워터마크 추가 도구는 사진 위에 맞춤 텍스트 또는 로고 이미지를 오버레이하여 저작권을 보호합니다. 투명도, 위치, 크기, 회전, 타일링을 조절하여 은은하거나 강한 워터마크를 만들 수 있으며, 온라인에 작품을 공유하는 사진작가, 아티스트, 콘텐츠 크리에이터에게 필수입니다.",
    },
    howItWorks: {
      en: "Your original image and optional watermark image are both loaded into HTML5 Canvas elements. The tool uses the Canvas 2D context's globalAlpha property to control opacity and compositing operations (globalCompositeOperation) for blending. Text watermarks are rendered with fillText(), supporting custom fonts, sizes, and colors. The watermark layer is drawn over the base image at the configured position and angle using translate() and rotate() transforms. For tiled watermarks, the pattern is repeated across the canvas in a grid.\n\nAll rendering happens entirely in your browser through the Canvas API. Your images are never uploaded to any external server, keeping your original files completely private and secure.",
      ko: "원본 이미지와 선택적 워터마크 이미지가 모두 HTML5 Canvas 요소에 로드됩니다. Canvas 2D 컨텍스트의 globalAlpha 속성으로 투명도를 제어하고, globalCompositeOperation으로 블렌딩을 처리합니다. 텍스트 워터마크는 fillText()로 렌더링되며 맞춤 폰트, 크기, 색상을 지원합니다. translate()와 rotate() 변환을 사용하여 설정된 위치와 각도에 워터마크 레이어를 그립니다. 타일 워터마크의 경우 패턴이 캔버스 전체에 격자형으로 반복됩니다.\n\n모든 렌더링이 Canvas API를 통해 브라우저에서 완전히 이루어집니다. 이미지가 외부 서버에 업로드되지 않으므로 원본 파일의 완벽한 개인정보 보호와 보안이 보장됩니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "image-rotate": {
    about: {
      en: "Image Rotate & Flip lets you rotate images by any angle (90, 180, 270, or custom degrees) and flip them horizontally or vertically. It is a quick fix for sideways photos, mirrored selfies, and scanned documents that need straightening — useful for anyone editing images without heavy software.",
      ko: "이미지 회전 및 뒤집기 도구는 90도, 180도, 270도 또는 사용자 지정 각도로 이미지를 회전하고, 좌우 또는 상하로 뒤집을 수 있습니다. 옆으로 찍힌 사진, 반전된 셀카, 정렬이 필요한 스캔 문서를 간편하게 수정할 수 있어, 별도의 프로그램 없이 이미지를 편집하려는 모든 분에게 유용합니다.",
    },
    howItWorks: {
      en: "The image is drawn onto an HTML5 Canvas and transformed using the 2D context's translate() and rotate() methods. For 90° and 270° rotations the canvas dimensions are swapped to accommodate the new orientation. Horizontal and vertical flips are achieved by applying negative scale factors via the scale() method before drawing. Custom-angle rotation recalculates the bounding box so no part of the image is clipped. The transformed result is exported as PNG or JPEG using toBlob().\n\nAll transformations are computed client-side with the Canvas API — your image data stays entirely in your browser and is never sent to an external server.",
      ko: "이미지는 HTML5 Canvas에 그려지고 2D 컨텍스트의 translate()와 rotate() 메서드로 변환됩니다. 90도 및 270도 회전 시 새 방향에 맞게 캔버스 크기가 바뀝니다. 좌우 및 상하 뒤집기는 그리기 전 scale() 메서드로 음수 스케일 팩터를 적용하여 구현합니다. 사용자 지정 각도 회전은 이미지가 잘리지 않도록 바운딩 박스를 재계산합니다. 변환된 결과는 toBlob()으로 PNG 또는 JPEG로 내보내집니다.\n\n모든 변환은 Canvas API를 사용하여 클라이언트 측에서 수행됩니다. 이미지 데이터가 브라우저 안에 머물며 외부 서버로 전송되지 않습니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "image-converter": {
    about: {
      en: "Image Format Converter transforms images between PNG, JPEG, WebP, and GIF formats with a single click. Choose the output format, adjust quality for lossy formats, and download instantly — perfect for web developers optimizing assets, designers delivering client files, and anyone needing quick format changes.",
      ko: "이미지 포맷 변환 도구는 PNG, JPEG, WebP, GIF 형식 간 이미지를 클릭 한 번으로 변환합니다. 출력 형식을 선택하고 손실 압축 형식의 품질을 조절한 후 즉시 다운로드할 수 있어, 웹 개발자, 디자이너, 빠른 형식 변환이 필요한 모든 분에게 적합합니다.",
    },
    howItWorks: {
      en: "The source image is loaded into the browser using the FileReader API and rendered on an HTML5 Canvas. To convert formats, the Canvas API's toBlob() or toDataURL() method is called with the target MIME type (image/png, image/jpeg, image/webp). For JPEG and WebP, a quality parameter controls lossy compression. GIF output is handled by a JavaScript-based GIF encoder that reads pixel data from the canvas via getImageData(). The resulting file is offered for download through a dynamically created Blob URL.\n\nThe entire conversion pipeline runs in your browser using the Canvas API and File API. No image data is uploaded to any server — your files remain 100% private.",
      ko: "원본 이미지는 FileReader API로 브라우저에 로드되어 HTML5 Canvas에 렌더링됩니다. 포맷 변환을 위해 Canvas API의 toBlob() 또는 toDataURL() 메서드가 대상 MIME 타입(image/png, image/jpeg, image/webp)으로 호출됩니다. JPEG과 WebP의 경우 품질 매개변수로 손실 압축을 제어합니다. GIF 출력은 getImageData()로 캔버스 픽셀 데이터를 읽는 JavaScript 기반 GIF 인코더가 처리합니다. 결과 파일은 동적으로 생성된 Blob URL을 통해 다운로드됩니다.\n\n전체 변환 파이프라인이 Canvas API와 File API를 사용하여 브라우저에서 실행됩니다. 이미지 데이터가 서버에 업로드되지 않으므로 파일이 100% 비공개로 유지됩니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "image-to-pdf": {
    about: {
      en: "Image to PDF converts one or more images into a single PDF document. Arrange pages by drag-and-drop, set page size and orientation, and control margins — ideal for combining scanned receipts, assembling photo portfolios, or packaging screenshots into a shareable document.",
      ko: "이미지를 PDF로 변환 도구는 하나 이상의 이미지를 하나의 PDF 문서로 변환합니다. 드래그 앤 드롭으로 페이지를 정렬하고, 페이지 크기와 방향, 여백을 설정할 수 있어, 스캔한 영수증 정리, 사진 포트폴리오 구성, 스크린샷 문서화에 이상적입니다.",
    },
    howItWorks: {
      en: "Each uploaded image is read via the FileReader API and decoded into pixel data. The tool uses the pdf-lib JavaScript library to create a new PDF document entirely in the browser. For every image, a new page is added with the configured size (A4, Letter, etc.) and orientation. Images are embedded as JPEG or PNG streams within the PDF and positioned according to your margin and scaling settings. The final PDF byte array is generated by pdf-lib's save() method and offered for download as a Blob.\n\nAll PDF generation runs client-side through pdf-lib and the File API. Your images and the resulting PDF never leave your browser, ensuring full data privacy.",
      ko: "업로드된 각 이미지는 FileReader API로 읽혀 픽셀 데이터로 디코딩됩니다. pdf-lib JavaScript 라이브러리를 사용하여 브라우저에서 완전히 새 PDF 문서를 생성합니다. 각 이미지마다 설정된 크기(A4, Letter 등)와 방향으로 새 페이지가 추가됩니다. 이미지는 PDF 내에 JPEG 또는 PNG 스트림으로 삽입되고 여백 및 스케일링 설정에 따라 배치됩니다. 최종 PDF 바이트 배열은 pdf-lib의 save() 메서드로 생성되어 Blob으로 다운로드됩니다.\n\n모든 PDF 생성이 pdf-lib와 File API를 통해 클라이언트 측에서 실행됩니다. 이미지와 결과 PDF가 브라우저를 벗어나지 않아 완벽한 데이터 개인정보 보호가 보장됩니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "image-to-svg": {
    about: {
      en: "Image to SVG converts raster images (PNG, JPEG) into scalable vector graphics using automatic tracing. The resulting SVG can be scaled to any size without pixelation, making it invaluable for converting logos, icons, line art, and simple illustrations into resolution-independent vector format.",
      ko: "이미지를 SVG로 변환 도구는 래스터 이미지(PNG, JPEG)를 자동 트레이싱을 통해 확장 가능한 벡터 그래픽으로 변환합니다. 결과 SVG는 픽셀 깨짐 없이 어떤 크기로든 확대할 수 있어, 로고, 아이콘, 선화, 간단한 일러스트를 해상도 독립적 벡터 형식으로 변환하는 데 매우 유용합니다.",
    },
    howItWorks: {
      en: "The uploaded raster image is drawn onto an HTML5 Canvas and its pixel data is extracted via getImageData(). A JavaScript-based image tracing algorithm (potrace or similar) analyzes brightness thresholds and edge boundaries to produce vector paths. The algorithm converts contiguous regions into Bezier curves and straight-line segments, outputting SVG <path> elements. You can adjust the color threshold, number of colors, and curve tolerance to fine-tune the vectorization result. The final SVG markup is assembled as a string and offered for download.\n\nThe entire tracing and SVG generation process runs in your browser using the Canvas API and JavaScript. No pixel data is ever transmitted to a server — your images remain fully private.",
      ko: "업로드된 래스터 이미지는 HTML5 Canvas에 그려지고 getImageData()로 픽셀 데이터가 추출됩니다. JavaScript 기반 이미지 트레이싱 알고리즘(potrace 또는 유사)이 밝기 임계값과 가장자리 경계를 분석하여 벡터 패스를 생성합니다. 알고리즘은 연속 영역을 베지어 곡선과 직선 세그먼트로 변환하여 SVG <path> 요소를 출력합니다. 색상 임계값, 색상 수, 곡선 허용치를 조정하여 벡터화 결과를 세밀하게 조정할 수 있습니다.\n\n전체 트레이싱 및 SVG 생성 과정이 Canvas API와 JavaScript를 사용하여 브라우저에서 실행됩니다. 픽셀 데이터가 서버로 전송되지 않으므로 이미지가 완전히 비공개로 유지됩니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "gif-maker": {
    about: {
      en: "GIF Maker turns a sequence of images into an animated GIF. Upload multiple frames, set the frame delay, adjust the canvas size, and preview the animation before downloading — great for creating reaction GIFs, simple animations, product showcases, and social media content.",
      ko: "GIF 만들기 도구는 여러 이미지를 애니메이션 GIF로 변환합니다. 여러 프레임을 업로드하고, 프레임 딜레이를 설정하고, 캔버스 크기를 조절하고, 다운로드 전 애니메이션을 미리 볼 수 있어, 리액션 GIF, 간단한 애니메이션, 제품 쇼케이스, SNS 콘텐츠 제작에 적합합니다.",
    },
    howItWorks: {
      en: "Each uploaded image is loaded via the FileReader API and drawn onto an HTML5 Canvas at the configured output dimensions. A JavaScript-based GIF encoder (gif.js or similar Web Worker-based library) reads the pixel data from each canvas frame using getImageData(). The encoder applies color quantization to reduce each frame to a 256-color palette, computes inter-frame differences for optimization, and assembles the frames into the GIF89a binary format with the specified delay between frames. The final animated GIF is output as a Blob and available for download.\n\nAll frame processing and GIF encoding happen entirely in your browser using Canvas API and Web Workers. No images are uploaded to any server — your content stays completely private.",
      ko: "업로드된 각 이미지는 FileReader API로 로드되어 설정된 출력 크기의 HTML5 Canvas에 그려집니다. JavaScript 기반 GIF 인코더(gif.js 또는 유사한 Web Worker 기반 라이브러리)가 getImageData()로 각 캔버스 프레임의 픽셀 데이터를 읽습니다. 인코더는 색상 양자화로 각 프레임을 256색 팔레트로 줄이고, 프레임 간 차이를 계산하여 최적화한 뒤, 지정된 딜레이와 함께 GIF89a 바이너리 형식으로 프레임을 조립합니다. 최종 애니메이션 GIF는 Blob으로 출력되어 다운로드할 수 있습니다.\n\n모든 프레임 처리와 GIF 인코딩이 Canvas API와 Web Workers를 사용하여 브라우저에서 완전히 이루어집니다. 이미지가 서버에 업로드되지 않아 콘텐츠가 완벽하게 비공개로 유지됩니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  /* ───────────────────────── FILE / PDF TOOLS ───────────────────────── */

  "pdf-to-word": {
    about: {
      en: "PDF to Word converts PDF documents into editable DOCX files right in your browser. It extracts text, basic formatting, and layout structure so you can edit the content in Microsoft Word, Google Docs, or any compatible word processor — ideal for students, office workers, and anyone who needs to modify a PDF.",
      ko: "PDF를 Word로 변환 도구는 브라우저에서 바로 PDF 문서를 편집 가능한 DOCX 파일로 변환합니다. 텍스트, 기본 서식, 레이아웃 구조를 추출하여 Microsoft Word, Google Docs 또는 호환 워드프로세서에서 편집할 수 있어, 학생, 직장인, PDF 수정이 필요한 모든 분에게 적합합니다.",
    },
    howItWorks: {
      en: "The PDF file is read as an ArrayBuffer via the File API. A JavaScript PDF parsing library (pdf-lib or pdf.js) extracts the text content, font metadata, and positional information from each page. The extracted data is then assembled into the Office Open XML (DOCX) format using a client-side DOCX generation library (such as docx.js). Text blocks are mapped to Word paragraphs with approximate font sizes and styles, and page breaks are preserved. The resulting DOCX file is packaged as a ZIP archive (the standard DOCX container) and offered for download as a Blob.\n\nThe entire conversion pipeline — PDF parsing, text extraction, and DOCX assembly — runs in your browser via JavaScript. Your documents are never uploaded to any server, ensuring complete confidentiality.",
      ko: "PDF 파일은 File API를 통해 ArrayBuffer로 읽힙니다. JavaScript PDF 파싱 라이브러리(pdf-lib 또는 pdf.js)가 각 페이지에서 텍스트 내용, 폰트 메타데이터, 위치 정보를 추출합니다. 추출된 데이터는 클라이언트 측 DOCX 생성 라이브러리(docx.js 등)를 사용하여 Office Open XML(DOCX) 형식으로 조립됩니다. 텍스트 블록은 대략적인 폰트 크기와 스타일로 Word 단락에 매핑되고, 페이지 나누기가 유지됩니다. 결과 DOCX 파일은 ZIP 아카이브(표준 DOCX 컨테이너)로 패키징되어 Blob으로 다운로드됩니다.\n\nPDF 파싱, 텍스트 추출, DOCX 조립 등 전체 변환 파이프라인이 JavaScript를 통해 브라우저에서 실행됩니다. 문서가 서버에 업로드되지 않아 완벽한 기밀성이 보장됩니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "pdf-compressor": {
    about: {
      en: "PDF Compressor reduces the file size of your PDF documents by optimizing images, removing redundant data, and streamlining internal structures. Shrink large PDFs for email, cloud storage, or faster web downloads while maintaining readable quality — essential for office professionals and anyone sharing documents online.",
      ko: "PDF 압축 도구는 이미지 최적화, 불필요한 데이터 제거, 내부 구조 간소화를 통해 PDF 문서의 파일 크기를 줄입니다. 이메일, 클라우드 저장소, 빠른 웹 다운로드를 위해 대용량 PDF를 읽을 수 있는 품질로 압축할 수 있어, 사무직 종사자와 온라인 문서 공유가 필요한 모든 분에게 필수입니다.",
    },
    howItWorks: {
      en: "The PDF is loaded as an ArrayBuffer through the File API and parsed using pdf-lib. The compression process works in several stages: embedded images are decoded, re-encoded at lower quality using Canvas toBlob(), and replaced in the PDF stream; duplicate font subsets and unused objects are identified and removed; and metadata streams are cleaned. The optimized PDF byte array is reassembled by pdf-lib's save() method with the useObjectStreams option enabled for additional size reduction. A before-and-after comparison shows exact bytes saved.\n\nAll parsing, image re-compression, and PDF reassembly happen entirely in your browser using pdf-lib, the Canvas API, and the File API. Your documents are never sent to any external server.",
      ko: "PDF는 File API를 통해 ArrayBuffer로 로드되어 pdf-lib로 파싱됩니다. 압축 과정은 여러 단계로 진행됩니다: 내장 이미지를 디코딩하고, Canvas toBlob()으로 낮은 품질로 재인코딩하여 PDF 스트림에서 교체합니다. 중복 폰트 서브셋과 미사용 객체를 식별하여 제거하고, 메타데이터 스트림을 정리합니다. 최적화된 PDF 바이트 배열은 추가 크기 축소를 위해 useObjectStreams 옵션이 활성화된 pdf-lib의 save() 메서드로 재조립됩니다. 전후 비교로 정확한 절약 용량을 보여줍니다.\n\n모든 파싱, 이미지 재압축, PDF 재조립이 pdf-lib, Canvas API, File API를 사용하여 브라우저에서 완전히 이루어집니다. 문서가 외부 서버로 전송되지 않습니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "pdf-merger": {
    about: {
      en: "PDF Merger combines multiple PDF files into a single document. Drag and drop to reorder pages, select specific page ranges from each file, and merge them instantly — perfect for assembling reports, combining invoices, or packaging multiple documents into one cohesive file.",
      ko: "PDF 합치기 도구는 여러 PDF 파일을 하나의 문서로 결합합니다. 드래그 앤 드롭으로 페이지 순서를 변경하고, 각 파일에서 특정 페이지 범위를 선택하여 즉시 합칠 수 있어, 보고서 조립, 송장 결합, 여러 문서를 하나로 정리하는 데 적합합니다.",
    },
    howItWorks: {
      en: "Each uploaded PDF is read as an ArrayBuffer using the File API and loaded with pdf-lib. The tool creates a new blank PDF document and iterates through your files in the specified order. For each source PDF, the selected pages are copied into the new document using pdf-lib's copyPages() method, which preserves original formatting, fonts, images, and annotations. Page dimensions and rotations are maintained exactly as in the originals. The merged PDF is generated via save() and made available for download as a Blob.\n\nThe entire merging process runs client-side using the pdf-lib library and the File API. Your PDF files are never uploaded to a server — everything stays in your browser for complete privacy.",
      ko: "업로드된 각 PDF는 File API를 사용하여 ArrayBuffer로 읽혀 pdf-lib로 로드됩니다. 도구는 새 빈 PDF 문서를 생성하고 지정된 순서로 파일들을 순회합니다. 각 원본 PDF에서 선택된 페이지는 pdf-lib의 copyPages() 메서드로 새 문서에 복사되며, 원본 서식, 폰트, 이미지, 주석이 보존됩니다. 페이지 크기와 회전도 원본 그대로 유지됩니다. 합쳐진 PDF는 save()로 생성되어 Blob으로 다운로드할 수 있습니다.\n\n전체 합치기 과정이 pdf-lib 라이브러리와 File API를 사용하여 클라이언트 측에서 실행됩니다. PDF 파일이 서버에 업로드되지 않아 브라우저에서 완벽한 개인정보 보호가 보장됩니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "pdf-splitter": {
    about: {
      en: "PDF Splitter divides a PDF document into separate files by page ranges, individual pages, or fixed intervals. Extract just the pages you need or break a large document into manageable pieces — ideal for isolating chapters, separating form pages, or distributing specific sections to colleagues.",
      ko: "PDF 나누기 도구는 페이지 범위, 개별 페이지, 일정 간격으로 PDF 문서를 별도의 파일로 분할합니다. 필요한 페이지만 추출하거나 대용량 문서를 관리하기 쉬운 조각으로 나눌 수 있어, 챕터 분리, 양식 페이지 분리, 동료에게 특정 섹션 배포에 이상적입니다.",
    },
    howItWorks: {
      en: "The uploaded PDF is parsed from an ArrayBuffer using pdf-lib. Based on your splitting criteria (page ranges like \"1-5, 8, 12-15\", every N pages, or each page individually), the tool creates one or more new PDF documents. For each output file, the relevant pages are copied from the source using copyPages(), preserving all content, formatting, and embedded resources. When multiple output files are produced, they are bundled into a ZIP archive using JSZip for convenient download. Single-file splits are offered directly as a PDF Blob.\n\nAll page extraction and document assembly happen in your browser using pdf-lib and the File API. Your PDF data never leaves your device — zero server interaction, full privacy.",
      ko: "업로드된 PDF는 pdf-lib를 사용하여 ArrayBuffer에서 파싱됩니다. 분할 기준(\"1-5, 8, 12-15\" 같은 페이지 범위, N페이지마다, 또는 개별 페이지)에 따라 하나 이상의 새 PDF 문서를 생성합니다. 각 출력 파일에 대해 copyPages()로 원본에서 관련 페이지를 복사하여 모든 내용, 서식, 내장 리소스를 보존합니다. 여러 출력 파일이 생성되면 JSZip으로 ZIP 아카이브에 묶어 편리하게 다운로드합니다. 단일 파일 분할은 PDF Blob으로 직접 제공됩니다.\n\n모든 페이지 추출과 문서 조립이 pdf-lib와 File API를 사용하여 브라우저에서 이루어집니다. PDF 데이터가 기기를 벗어나지 않아 서버 통신 없이 완벽한 개인정보 보호가 보장됩니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "pdf-to-excel": {
    about: {
      en: "PDF to Excel extracts tables and structured data from PDF documents into downloadable XLSX spreadsheets. It automatically detects table boundaries, rows, and columns, making it the go-to tool for accountants, analysts, and anyone who needs to work with tabular PDF data in Excel or Google Sheets.",
      ko: "PDF를 Excel로 변환 도구는 PDF 문서에서 표와 구조화된 데이터를 추출하여 다운로드 가능한 XLSX 스프레드시트로 변환합니다. 표 경계, 행, 열을 자동으로 감지하여, PDF의 표 데이터를 Excel이나 Google Sheets에서 작업해야 하는 회계사, 분석가 및 모든 분에게 필수 도구입니다.",
    },
    howItWorks: {
      en: "The PDF file is loaded as an ArrayBuffer via the File API and parsed using pdf.js to extract text content with precise positional coordinates (x, y, width, height) for each text item. A table-detection algorithm groups nearby text items into rows and columns based on their alignment and spacing patterns. The identified table structure is then written into an XLSX file using a client-side spreadsheet library (such as SheetJS/xlsx). Cell values, column widths, and row groupings are mapped to Excel cells. The final XLSX file is generated as a binary Blob for download.\n\nAll PDF parsing, table detection, and Excel generation happen entirely in your browser using pdf.js, SheetJS, and the File API. Your documents never leave your device.",
      ko: "PDF 파일은 File API를 통해 ArrayBuffer로 로드되어 pdf.js로 파싱됩니다. 각 텍스트 항목의 정확한 위치 좌표(x, y, 너비, 높이)와 함께 텍스트 내용이 추출됩니다. 표 감지 알고리즘이 정렬 및 간격 패턴을 기반으로 인접한 텍스트 항목을 행과 열로 그룹화합니다. 식별된 표 구조는 클라이언트 측 스프레드시트 라이브러리(SheetJS/xlsx 등)를 사용하여 XLSX 파일로 작성됩니다. 셀 값, 열 너비, 행 그룹이 Excel 셀에 매핑됩니다. 최종 XLSX 파일은 바이너리 Blob으로 생성되어 다운로드됩니다.\n\n모든 PDF 파싱, 표 감지, Excel 생성이 pdf.js, SheetJS, File API를 사용하여 브라우저에서 완전히 이루어집니다. 문서가 기기를 벗어나지 않습니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "pdf-to-jpg": {
    about: {
      en: "PDF to JPG converts each page of a PDF document into a high-quality JPEG image. Choose the output resolution (DPI), select specific pages or convert all at once, and download individual images or a ZIP bundle — useful for presentations, social media sharing, and archiving PDF content as images.",
      ko: "PDF를 이미지로 변환 도구는 PDF 문서의 각 페이지를 고품질 JPEG 이미지로 변환합니다. 출력 해상도(DPI)를 선택하고, 특정 페이지를 지정하거나 전체를 한 번에 변환하여, 개별 이미지 또는 ZIP 묶음으로 다운로드할 수 있어 프레젠테이션, SNS 공유, PDF 콘텐츠 이미지 보관에 유용합니다.",
    },
    howItWorks: {
      en: "The PDF file is loaded as an ArrayBuffer using the File API and rendered with pdf.js (Mozilla's PDF rendering engine). Each page is drawn onto an HTML5 Canvas at the user-specified DPI by setting the viewport scale accordingly. The Canvas API's toBlob() method then exports each rendered page as a JPEG image with configurable quality. For multi-page conversions, all resulting images are packaged into a ZIP archive using JSZip. Single-page conversions are downloaded directly as JPEG files.\n\nAll PDF rendering and image export happen client-side using pdf.js, the Canvas API, and JSZip. Your PDF files are processed entirely in the browser and never uploaded to any server.",
      ko: "PDF 파일은 File API를 사용하여 ArrayBuffer로 로드되어 pdf.js(Mozilla의 PDF 렌더링 엔진)로 렌더링됩니다. 사용자가 지정한 DPI에 맞게 뷰포트 스케일을 설정하여 각 페이지를 HTML5 Canvas에 그립니다. Canvas API의 toBlob() 메서드가 렌더링된 각 페이지를 설정 가능한 품질의 JPEG 이미지로 내보냅니다. 다중 페이지 변환 시 모든 결과 이미지가 JSZip을 사용하여 ZIP 아카이브로 패키징됩니다. 단일 페이지 변환은 JPEG 파일로 직접 다운로드됩니다.\n\n모든 PDF 렌더링과 이미지 내보내기가 pdf.js, Canvas API, JSZip을 사용하여 클라이언트 측에서 이루어집니다. PDF 파일이 브라우저에서 완전히 처리되며 서버에 업로드되지 않습니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "excel-merge": {
    about: {
      en: "Excel Merge combines multiple Excel (XLSX) files or sheets into a single unified spreadsheet. Merge by appending rows, combining matching columns, or consolidating multiple sheets — perfect for HR teams merging employee data, analysts combining monthly reports, and anyone unifying scattered spreadsheet data.",
      ko: "엑셀 파일 합치기 도구는 여러 Excel(XLSX) 파일 또는 시트를 하나의 통합 스프레드시트로 결합합니다. 행 추가, 일치하는 열 결합, 여러 시트 통합 등의 방식으로 합칠 수 있어, 직원 데이터를 합치는 HR 팀, 월별 보고서를 결합하는 분석가, 분산된 스프레드시트를 통합하려는 모든 분에게 적합합니다.",
    },
    howItWorks: {
      en: "Each uploaded XLSX file is read as an ArrayBuffer through the File API and parsed using the SheetJS (xlsx) library, which extracts worksheets, cell values, formulas, and formatting. The tool offers multiple merge strategies: row-append (stacking all data vertically), column-match (aligning by header names), or sheet-consolidation (each source file becomes a separate sheet). After merging, SheetJS assembles the combined data into a new XLSX workbook. The output file is generated as a binary Blob and offered for download.\n\nAll spreadsheet parsing and merging run entirely in your browser using SheetJS and the File API. No file data is ever transmitted to an external server — your business data remains fully confidential.",
      ko: "업로드된 각 XLSX 파일은 File API를 통해 ArrayBuffer로 읽혀 SheetJS(xlsx) 라이브러리로 파싱됩니다. 워크시트, 셀 값, 수식, 서식이 추출됩니다. 도구는 여러 병합 전략을 제공합니다: 행 추가(모든 데이터를 세로로 쌓기), 열 매칭(헤더 이름으로 정렬), 시트 통합(각 원본 파일이 별도 시트가 됨). 병합 후 SheetJS가 결합된 데이터를 새 XLSX 워크북으로 조립합니다. 출력 파일은 바이너리 Blob으로 생성되어 다운로드됩니다.\n\n모든 스프레드시트 파싱과 병합이 SheetJS와 File API를 사용하여 브라우저에서 완전히 실행됩니다. 파일 데이터가 외부 서버로 전송되지 않아 비즈니스 데이터의 완벽한 기밀성이 유지됩니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "excel-to-pdf": {
    about: {
      en: "Excel to PDF converts your XLSX spreadsheets into professionally formatted PDF documents. It preserves table layouts, column widths, and cell styling so your data looks presentation-ready — ideal for sharing financial reports, invoices, and data summaries as universally readable PDF files.",
      ko: "엑셀을 PDF로 변환 도구는 XLSX 스프레드시트를 전문적으로 포맷된 PDF 문서로 변환합니다. 표 레이아웃, 열 너비, 셀 스타일을 유지하여 발표용으로 깔끔하게 보이며, 재무 보고서, 송장, 데이터 요약을 범용 PDF 파일로 공유하는 데 이상적입니다.",
    },
    howItWorks: {
      en: "The XLSX file is loaded as an ArrayBuffer via the File API and parsed with SheetJS to extract cell data, column widths, row heights, and basic formatting (bold, alignment, borders). The extracted table structure is rendered onto an HTML5 Canvas or constructed as a virtual HTML table, accurately reproducing the spreadsheet layout. The rendered output is then converted to PDF pages using pdf-lib (or jsPDF), with each worksheet mapped to one or more pages depending on content size. Page margins, orientation, and paper size are configurable. The final PDF is saved as a Blob for download.\n\nThe complete conversion — Excel parsing, layout rendering, and PDF generation — runs in your browser using SheetJS, pdf-lib, and the Canvas API. Your spreadsheet data never leaves your device.",
      ko: "XLSX 파일은 File API를 통해 ArrayBuffer로 로드되어 SheetJS로 파싱됩니다. 셀 데이터, 열 너비, 행 높이, 기본 서식(굵기, 정렬, 테두리)이 추출됩니다. 추출된 표 구조는 HTML5 Canvas에 렌더링되거나 가상 HTML 테이블로 구성되어 스프레드시트 레이아웃을 정확히 재현합니다. 렌더링된 출력은 pdf-lib(또는 jsPDF)를 사용하여 PDF 페이지로 변환되며, 각 워크시트는 내용 크기에 따라 하나 이상의 페이지에 매핑됩니다. 페이지 여백, 방향, 용지 크기를 설정할 수 있습니다. 최종 PDF는 Blob으로 저장되어 다운로드됩니다.\n\nExcel 파싱, 레이아웃 렌더링, PDF 생성 등 전체 변환이 SheetJS, pdf-lib, Canvas API를 사용하여 브라우저에서 실행됩니다. 스프레드시트 데이터가 기기를 벗어나지 않습니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },

  "word-to-pdf": {
    about: {
      en: "Word to PDF converts DOCX documents into PDF format directly in your browser. It preserves text formatting, headings, lists, and basic table layouts, producing a universally shareable PDF — essential for job seekers converting resumes, students submitting assignments, and professionals distributing finalized documents.",
      ko: "Word를 PDF로 변환 도구는 브라우저에서 직접 DOCX 문서를 PDF 형식으로 변환합니다. 텍스트 서식, 제목, 목록, 기본 표 레이아웃을 유지하여 범용 공유 가능한 PDF를 생성하며, 이력서를 변환하는 구직자, 과제를 제출하는 학생, 최종 문서를 배포하는 전문가에게 필수입니다.",
    },
    howItWorks: {
      en: "The DOCX file is read as an ArrayBuffer through the File API and unzipped to access its Office Open XML structure. A JavaScript DOCX parser (such as mammoth.js or docx-preview) extracts the document content — paragraphs, headings, lists, tables, bold/italic formatting, and font sizes — and converts them into a structured intermediate representation. This content is then rendered either onto HTML elements or directly onto an HTML5 Canvas, preserving layout and pagination. The rendered pages are converted into PDF format using pdf-lib or jsPDF, with each page captured at print-quality resolution. The final PDF is output as a Blob for immediate download.\n\nEvery step — DOCX parsing, content rendering, and PDF assembly — runs entirely client-side in your browser using JavaScript libraries and the File API. Your documents are never sent to any server, ensuring total privacy and security.",
      ko: "DOCX 파일은 File API를 통해 ArrayBuffer로 읽혀 Office Open XML 구조에 접근하기 위해 압축이 해제됩니다. JavaScript DOCX 파서(mammoth.js 또는 docx-preview 등)가 문서 내용 — 단락, 제목, 목록, 표, 굵기/기울임 서식, 폰트 크기 — 을 추출하여 구조화된 중간 표현으로 변환합니다. 이 내용은 HTML 요소로 렌더링되거나 HTML5 Canvas에 직접 렌더링되어 레이아웃과 페이지 구분이 유지됩니다. 렌더링된 페이지는 pdf-lib 또는 jsPDF를 사용하여 인쇄 품질 해상도로 PDF 형식으로 변환됩니다. 최종 PDF는 Blob으로 출력되어 즉시 다운로드할 수 있습니다.\n\nDOCX 파싱, 콘텐츠 렌더링, PDF 조립 등 모든 단계가 JavaScript 라이브러리와 File API를 사용하여 브라우저에서 완전히 클라이언트 측으로 실행됩니다. 문서가 어떤 서버로도 전송되지 않아 완벽한 개인정보 보호와 보안이 보장됩니다.",
    },
    howItWorksTitle: { en: "How It Works", ko: "작동 방식" },
  },
};
