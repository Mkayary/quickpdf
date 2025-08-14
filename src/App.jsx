import { useState } from 'react'
import { convertFile, mergePDFs, downloadFile, downloadAsZip } from './utils/fileConverter'
import './App.css'

function App() {
  const [files, setFiles] = useState([])
  const [converting, setConverting] = useState(false)
  const [convertedFiles, setConvertedFiles] = useState([])
  const [progress, setProgress] = useState(0)
  const [currentTab, setCurrentTab] = useState('to-pdf')

  const handleFileUpload = (event, conversionType) => {
    const uploadedFiles = Array.from(event.target.files)
    setFiles(uploadedFiles)
    setConvertedFiles([])
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event, conversionType) => {
    event.preventDefault()
    event.stopPropagation()
    const droppedFiles = Array.from(event.dataTransfer.files)
    setFiles(droppedFiles)
    setConvertedFiles([])
  }

  const handleConvert = async (conversionType) => {
    if (files.length === 0) return

    setConverting(true)
    setProgress(0)
    setConvertedFiles([])

    try {
      if (conversionType === 'merge' && files.length > 1) {
        // Merge multiple PDFs
        const result = await mergePDFs(files)
        setConvertedFiles([result])
        setProgress(100)
      } else {
        // Convert individual files
        const results = []
        for (let i = 0; i < files.length; i++) {
          try {
            const result = await convertFile(files[i], conversionType)
            results.push(result)
            setProgress(((i + 1) / files.length) * 100)
          } catch (error) {
            console.error(`Error converting ${files[i].name}:`, error)
            // Continue with other files
          }
        }
        setConvertedFiles(results)
      }
    } catch (error) {
      console.error('Conversion error:', error)
      alert('Conversion failed: ' + error.message)
    } finally {
      setConverting(false)
    }
  }

  const handleDownload = (file) => {
    downloadFile(file.blob, file.filename)
  }

  const handleDownloadAll = async () => {
    if (convertedFiles.length === 1) {
      handleDownload(convertedFiles[0])
    } else {
      await downloadAsZip(convertedFiles)
    }
  }

  const resetFiles = () => {
    setFiles([])
    setConvertedFiles([])
    setProgress(0)
  }

  const getAcceptedFileTypes = (conversionType) => {
    switch (conversionType) {
      case 'to-pdf':
        return '.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.html,.htm'
      case 'from-pdf':
        return '.pdf'
      case 'merge':
        return '.pdf'
      case 'compress':
        return '.pdf'
      default:
        return '*'
    }
  }

  const TabButton = ({ value, children, active, onClick }) => (
    <button
      className={`px-6 py-3 font-medium rounded-lg transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      onClick={() => onClick(value)}
    >
      {children}
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">PDF</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">QuickPDF</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#convert" className="text-gray-700 hover:text-blue-600 transition-colors">Convert</a>
              <a href="#merge" className="text-gray-700 hover:text-blue-600 transition-colors">Merge</a>
              <a href="#compress" className="text-gray-700 hover:text-blue-600 transition-colors">Compress</a>
              <a href="#faq" className="text-gray-700 hover:text-blue-600 transition-colors">FAQ</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Convert Any File to PDF in Seconds
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Support for DOCX, PPT, JPG, HTML - No watermarks, completely free
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <span className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded-full">DOCX</span>
            <span className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded-full">PPT</span>
            <span className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded-full">JPG</span>
            <span className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded-full">HTML</span>
          </div>
        </div>
      </section>

      {/* Conversion Tool Section */}
      <section id="convert" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <TabButton
              value="to-pdf"
              active={currentTab === 'to-pdf'}
              onClick={setCurrentTab}
            >
              To PDF
            </TabButton>
            <TabButton
              value="from-pdf"
              active={currentTab === 'from-pdf'}
              onClick={setCurrentTab}
            >
              From PDF
            </TabButton>
            <TabButton
              value="merge"
              active={currentTab === 'merge'}
              onClick={setCurrentTab}
            >
              Merge
            </TabButton>
            <TabButton
              value="compress"
              active={currentTab === 'compress'}
              onClick={setCurrentTab}
            >
              Compress
            </TabButton>
          </div>

          {/* Conversion Interface */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-6">
              {currentTab === 'to-pdf' && 'Convert to PDF'}
              {currentTab === 'from-pdf' && 'Convert from PDF'}
              {currentTab === 'merge' && 'Merge PDFs'}
              {currentTab === 'compress' && 'Compress PDF'}
            </h3>
            
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, currentTab)}
              onClick={() => document.getElementById(`file-upload-${currentTab}`).click()}
            >
              <div className="w-12 h-12 bg-gray-400 rounded mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold">↑</span>
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop files here
              </p>
              <p className="text-gray-500 mb-4">or click to browse</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Choose Files
              </button>
              <input
                id={`file-upload-${currentTab}`}
                type="file"
                multiple={currentTab !== 'compress'}
                accept={getAcceptedFileTypes(currentTab)}
                className="hidden"
                onChange={(e) => handleFileUpload(e, currentTab)}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Selected Files ({files.length}):</h4>
                  <button
                    onClick={resetFiles}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium truncate">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                {converting && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Converting...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Convert Button */}
                <button
                  className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={converting}
                  onClick={() => handleConvert(currentTab)}
                >
                  {converting ? 'Converting...' : 
                   currentTab === 'merge' ? 'Merge PDFs' :
                   currentTab === 'compress' ? 'Compress PDF' :
                   'Convert Files'}
                </button>
              </div>
            )}

            {/* Converted Files */}
            {convertedFiles.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-3">
                  ✓ Conversion Complete! ({convertedFiles.length} files)
                </h4>
                <div className="space-y-2">
                  {convertedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm font-medium">{file.filename}</span>
                      <button
                        onClick={() => handleDownload(file)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
                {convertedFiles.length > 1 && (
                  <button
                    onClick={handleDownloadAll}
                    className="w-full mt-3 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Download All as ZIP
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose QuickPDF?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded"></div>
              </div>
              <h4 className="text-lg font-semibold mb-2">No Registration</h4>
              <p className="text-gray-600">Start converting immediately without creating an account</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-600 rounded"></div>
              </div>
              <h4 className="text-lg font-semibold mb-2">Batch Conversion</h4>
              <p className="text-gray-600">Convert multiple files at once to save time</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded"></div>
              </div>
              <h4 className="text-lg font-semibold mb-2">Mobile Friendly</h4>
              <p className="text-gray-600">Works perfectly on all devices and screen sizes</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-orange-600 rounded"></div>
              </div>
              <h4 className="text-lg font-semibold mb-2">Secure & Private</h4>
              <p className="text-gray-600">Files are processed locally and never stored on our servers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Tools Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Need More Advanced PDF Tools?
          </h3>
          <p className="text-center text-gray-600 mb-12">
            For professional PDF editing, OCR, and advanced features, check out these premium tools
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 font-bold text-xl">PDF</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Adobe Acrobat Pro</h4>
              <p className="text-gray-600 mb-4">Industry-standard PDF editor with OCR, forms, and digital signatures</p>
              <a 
                href="https://www.adobe.com/acrobat/pricing.html?ref=quickpdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors inline-block"
              >
                Try Free Trial
              </a>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">PDF</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">PDFElement</h4>
              <p className="text-gray-600 mb-4">Affordable alternative with powerful editing and conversion features</p>
              <a 
                href="https://pdf.wondershare.com/?ref=quickpdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Get 30% Off
              </a>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl">PDF</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Smallpdf Pro</h4>
              <p className="text-gray-600 mb-4">Cloud-based PDF tools with unlimited access and batch processing</p>
              <a 
                href="https://smallpdf.com/pricing?ref=quickpdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
              >
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* AdSense Banner */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* AdSense Responsive Banner */}
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8">
            <p className="text-gray-500 text-sm mb-2">Advertisement</p>
            <div className="h-24 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-400">Google AdSense Banner (728x90)</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold mb-2">What file formats do you support?</h4>
              <p className="text-gray-600">We support converting DOCX, PPT, JPG, PNG, and HTML files to PDF. You can also merge multiple PDFs and compress existing PDF files.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold mb-2">Is there a file size limit?</h4>
              <p className="text-gray-600">For optimal performance, we recommend files under 50MB each. Larger files may take longer to process.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold mb-2">Are my files secure?</h4>
              <p className="text-gray-600">Yes! All file processing happens locally in your browser. Your files are never uploaded to our servers, ensuring complete privacy.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold mb-2">Can I convert multiple files at once?</h4>
              <p className="text-gray-600">Absolutely! You can select multiple files and convert them all at once. The converted files can be downloaded individually or as a ZIP archive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Privacy Disclaimer */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h4 className="text-lg font-semibold mb-3">Privacy & Security</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your privacy is our priority. All file conversions are processed locally in your browser using JavaScript. 
              Your files are never uploaded to our servers, ensuring complete privacy and security. We use cookies only 
              for analytics and advertising purposes. By using this service, you agree to our privacy practices.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-6 w-6 bg-white rounded flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-xs">PDF</span>
                </div>
                <span className="text-xl font-bold">QuickPDF</span>
              </div>
              <p className="text-gray-400">
                The fastest and most reliable PDF conversion tool on the web.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Tools</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#convert" className="hover:text-white transition-colors">PDF Converter</a></li>
                <li><a href="#merge" className="hover:text-white transition-colors">Merge PDFs</a></li>
                <li><a href="#compress" className="hover:text-white transition-colors">Compress PDF</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#disclaimer" className="hover:text-white transition-colors">Disclaimer</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:support@quickpdf.com" className="hover:text-white transition-colors">Email Support</a></li>
                <li><a href="#help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#feedback" className="hover:text-white transition-colors">Feedback</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 QuickPDF. All rights reserved. | 
              <a href="#privacy" className="hover:text-white ml-2">Privacy</a> | 
              <a href="#terms" className="hover:text-white ml-2">Terms</a> | 
              <a href="#cookies" className="hover:text-white ml-2">Cookie Policy</a>
            </p>
            <p className="mt-2 text-xs">
              Affiliate Disclosure: We may earn a commission from purchases made through our affiliate links.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

