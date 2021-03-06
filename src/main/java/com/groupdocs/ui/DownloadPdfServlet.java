package com.groupdocs.ui;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.groupdocs.viewer.domain.PageData;
import com.groupdocs.viewer.domain.containers.DocumentInfoContainer;
import com.groupdocs.viewer.domain.options.DocumentInfoOptions;
import com.groupdocs.viewer.domain.options.PdfFileOptions;
import com.groupdocs.viewer.handler.ViewerHtmlHandler;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.apache.commons.io.FilenameUtils;

@WebServlet("/download/pdf")
public class DownloadPdfServlet
        extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String filename = request.getParameter("file");
        ViewerHtmlHandler handler = Utils.createViewerHtmlHandler();
        
        PdfFileOptions o = new PdfFileOptions();
        String watermarkText = request.getParameter("watermarkText");
        if(watermarkText!=null && watermarkText.length()>0)
        	o.setWatermark(Utils.getWatermark(watermarkText,request.getParameter("watermarkColor"),
        			request.getParameter("watermarkPosition"),request.getParameter("watermarkWidth")));
        
        InputStream pdf = null;
        try {
            pdf = handler.getPdfFile(filename,o).getStream();
        } catch (Exception x) {
            throw new RuntimeException(x);
        }

        if (Objects.equals(request.getParameter("isdownload"), "true"))
        {
            response.setContentType("application/octet-stream");
            response.addHeader("content-disposition", "attachment; filename=" + FilenameUtils.removeExtension(filename) + ".pdf");
            //filename.split(".")[filename.indexOf('.',filename.length()-5)]
        }
        else
        {
            response.setContentType("application/pdf");
        }

        Utils.writeToResponse(pdf, response);
    }
}

