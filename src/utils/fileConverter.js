import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import mammoth from 'mammoth'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

// Convert image to PDF
export const imageToPDF = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const img = new Image()
        img.onload = () => {
          const pdf = new jsPDF()
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Calculate dimensions to fit page
          const pageWidth = pdf.internal.pageSize.getWidth()
          const pageHeight = pdf.internal.pageSize.getHeight()
          const imgRatio = img.width / img.height
          const pageRatio = pageWidth / pageHeight
          
          let width, height
          if (imgRatio > pageRatio) {
            width = pageWidth
            height = pageWidth / imgRatio
          } else {
            height = pageHeight
            width = pageHeight * imgRatio
          }
          
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95)
          pdf.addImage(imgData, 'JPEG', 0, 0, width, height)
          
          const pdfBlob = pdf.output('blob')
          resolve({
            blob: pdfBlob,
            filename: file.name.replace(/\.[^/.]+$/, '.pdf')
          })
        }
        img.src = event.target.result
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Convert DOCX to PDF
export const docxToPDF = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result
        const result = await mammoth.convertToHtml({ arrayBuffer })
        
        // Create a temporary div to render HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = result.value
        tempDiv.style.position = 'absolute'
        tempDiv.style.left = '-9999px'
        tempDiv.style.width = '800px'
        tempDiv.style.padding = '20px'
        tempDiv.style.fontFamily = 'Arial, sans-serif'
        tempDiv.style.fontSize = '12px'
        tempDiv.style.lineHeight = '1.5'
        tempDiv.style.backgroundColor = 'white'
        document.body.appendChild(tempDiv)
        
        // Convert HTML to canvas then to PDF
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        })
        
        document.body.removeChild(tempDiv)
        
        const pdf = new jsPDF()
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = pdf.internal.pageSize.getWidth()
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
        
        const pdfBlob = pdf.output('blob')
        resolve({
          blob: pdfBlob,
          filename: file.name.replace(/\.[^/.]+$/, '.pdf')
        })
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

// Convert HTML to PDF
export const htmlToPDF = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const htmlContent = event.target.result
        
        // Create a temporary div to render HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = htmlContent
        tempDiv.style.position = 'absolute'
        tempDiv.style.left = '-9999px'
        tempDiv.style.width = '800px'
        tempDiv.style.padding = '20px'
        tempDiv.style.fontFamily = 'Arial, sans-serif'
        tempDiv.style.fontSize = '12px'
        tempDiv.style.lineHeight = '1.5'
        tempDiv.style.backgroundColor = 'white'
        document.body.appendChild(tempDiv)
        
        // Convert HTML to canvas then to PDF
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        })
        
        document.body.removeChild(tempDiv)
        
        const pdf = new jsPDF()
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = pdf.internal.pageSize.getWidth()
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
        
        const pdfBlob = pdf.output('blob')
        resolve({
          blob: pdfBlob,
          filename: file.name.replace(/\.[^/.]+$/, '.pdf')
        })
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// Merge multiple PDFs
export const mergePDFs = async (files) => {
  try {
    const mergedPdf = await PDFDocument.create()
    
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach((page) => mergedPdf.addPage(page))
    }
    
    const pdfBytes = await mergedPdf.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    
    return {
      blob,
      filename: 'merged.pdf'
    }
  } catch (error) {
    throw new Error('Failed to merge PDFs: ' + error.message)
  }
}

// Compress PDF
export const compressPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    
    // Basic compression by re-saving
    const pdfBytes = await pdf.save({
      useObjectStreams: false,
      addDefaultPage: false
    })
    
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    
    return {
      blob,
      filename: file.name.replace('.pdf', '_compressed.pdf')
    }
  } catch (error) {
    throw new Error('Failed to compress PDF: ' + error.message)
  }
}

// Convert file based on type
export const convertFile = async (file, conversionType) => {
  const fileExtension = file.name.split('.').pop().toLowerCase()
  
  try {
    switch (conversionType) {
      case 'to-pdf':
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          return await imageToPDF(file)
        } else if (fileExtension === 'docx') {
          return await docxToPDF(file)
        } else if (['html', 'htm'].includes(fileExtension)) {
          return await htmlToPDF(file)
        } else {
          throw new Error(`Unsupported file type: ${fileExtension}`)
        }
      
      case 'merge':
        if (fileExtension === 'pdf') {
          return file // Return as-is for merging
        } else {
          throw new Error('Only PDF files can be merged')
        }
      
      case 'compress':
        if (fileExtension === 'pdf') {
          return await compressPDF(file)
        } else {
          throw new Error('Only PDF files can be compressed')
        }
      
      default:
        throw new Error(`Unknown conversion type: ${conversionType}`)
    }
  } catch (error) {
    throw new Error(`Conversion failed for ${file.name}: ${error.message}`)
  }
}

// Download file
export const downloadFile = (blob, filename) => {
  saveAs(blob, filename)
}

// Download multiple files as ZIP
export const downloadAsZip = async (files, zipName = 'converted_files.zip') => {
  const zip = new JSZip()
  
  files.forEach((file, index) => {
    zip.file(file.filename, file.blob)
  })
  
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, zipName)
}

