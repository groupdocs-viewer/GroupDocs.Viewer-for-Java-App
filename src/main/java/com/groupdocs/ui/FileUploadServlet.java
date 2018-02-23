package com.groupdocs.ui;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.groupdocs.viewer.domain.FileDescription;
import com.groupdocs.viewer.handler.ViewerHtmlHandler;
import org.apache.commons.io.IOUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.*;
import java.nio.file.Paths;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@WebServlet("/upload/file")
@MultipartConfig
public class FileUploadServlet
        extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        ViewerHtmlHandler handler = Utils.createViewerHtmlHandler();

        try
        {
            List<Part> fileParts = request.getParts().stream().filter(part -> "uploadedfile".equals(part.getName())).collect(Collectors.toList());
            for (Part filePart : fileParts) {
                String fileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString(); // MSIE fix.
                InputStream fileContent = filePart.getInputStream();
                String filePath = Utils.getProjectProperty("storage.path") + "\\" + fileName;
                OutputStream outStream = new FileOutputStream(filePath);
                IOUtils.copy(fileContent,outStream);
                fileContent.close();
                outStream.close();
            }
        }
        catch (Exception x)
        {
            throw new RuntimeException(x);
        }
    }
}
