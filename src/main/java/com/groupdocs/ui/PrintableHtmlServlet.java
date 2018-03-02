package com.groupdocs.ui;

import com.groupdocs.viewer.domain.containers.PrintableHtmlContainer;
import com.groupdocs.viewer.domain.options.PrintableHtmlOptions;
import com.groupdocs.viewer.handler.ViewerHtmlHandler;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;

@WebServlet("/printable/html")
public class PrintableHtmlServlet
        extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        ViewerHtmlHandler handler = Utils.createViewerHtmlHandler();
        try
        {
            String filename = request.getParameter("file");
            String watermarkText = request.getParameter("watermarkText");
            PrintableHtmlOptions o = new PrintableHtmlOptions();

            if(watermarkText!=null && watermarkText.length()>0)
                o.setWatermark(Utils.getWatermark(watermarkText,request.getParameter("watermarkColor"),
                        request.getParameter("watermarkPosition"),request.getParameter("watermarkWidth")));

            PrintableHtmlContainer container = handler.getPrintableHtml(filename, o);
            response.setContentType("text/plain");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(container.getHtmlContent().replace(".doc-page { position: absolute; }", ".doc-page { position: relative; }"));
        }
        catch (Exception x)
        {
            throw new RuntimeException(x);
        }
    }
}